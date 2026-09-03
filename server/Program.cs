using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StoreApi.Data;
using StoreApi.Features.Category;
using StoreApi.Features.Notification;
using StoreApi.Features.Order;
using StoreApi.Features.Product;
using StoreApi.Features.Supplier;
using StoreApi.Features.User;
using StoreApi.Hubs;
using System.Text;

// using StoreApi.Hubs;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// -----------------------------
// DATABASE
// -----------------------------

builder.Services.AddDbContext<StoreDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")

    )
);

builder.Services.AddScoped<CategoryRepository>();
builder.Services.AddScoped<CategoryService>();

builder.Services.AddScoped<ProductRepository>();
builder.Services.AddScoped<ProductService>();

builder.Services.AddScoped<SupplierRepository>();
builder.Services.AddScoped<SupplierService>();

builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<OrderService>();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>();

builder.Services.AddScoped<NotificationRepository>();
builder.Services.AddScoped<NotificationService>();
// -----------------------------
// CORS
// -----------------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();

    });
});


// -----------------------------
// AUTHENTICATION
// -----------------------------

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration[
                        "Jwt:Issuer"
                    ],

                ValidAudience =
                    builder.Configuration[
                        "Jwt:Audience"
                    ],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration[
                                "Jwt:Key"
                            ]!
                        )
                    ),

                ClockSkew = TimeSpan.Zero
            };

        options.Events =
            new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken =
                        context.Request.Query[
                            "access_token"
                        ];

                    var requestPath =
                        context.HttpContext
                            .Request.Path;

                    if (
                        !string.IsNullOrWhiteSpace(
                            accessToken
                        ) &&
                        requestPath
                            .StartsWithSegments(
                                "/notificationHub"
                            )
                    )
                    {
                        context.Token =
                            accessToken;
                    }

                    return Task.CompletedTask;
                }
            };
    });

//builder.Services
//    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,

//            ValidIssuer = builder.Configuration["Jwt:Issuer"],
//            ValidAudience = builder.Configuration["Jwt:Audience"],

//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes(
//                    builder.Configuration["Jwt:Key"]!
//                )
//            )
//        };

//        // SignalR browser clients can send the JWT token
//        // through the access_token query parameter.
//        options.Events = new JwtBearerEvents
//        {
//            OnMessageReceived = context =>
//            {
//                var accessToken =
//                    context.Request.Query["access_token"];

//                var requestPath =
//                    context.HttpContext.Request.Path;

//                if (!string.IsNullOrEmpty(accessToken) &&
//                    requestPath.StartsWithSegments(
//                        "/hubs/store"
//                    ))
//                {
//                    context.Token = accessToken;
//                }

//                return Task.CompletedTask;
//            }
//        };

//    });




// -----------------------------
// AUTHORIZATION
// -----------------------------

builder.Services.AddAuthorization();


// -----------------------------
// CONTROLLERS
// -----------------------------

builder.Services.AddControllers();

 builder.Services.AddSignalR();


// -----------------------------
// SWAGGER
// -----------------------------

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter JWT Token"
        }
    );

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        }
    );
});


// -----------------------------
// BUILD APPLICATION
// -----------------------------

var app = builder.Build();


// -----------------------------
// MIDDLEWARE
// -----------------------------

app.UseSwagger();

app.UseSwaggerUI();

//app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();


//SignalR endpoint

app.MapHub<NotificationHub>(
    "/notificationHub");


app.Run();