using System.ComponentModel.DataAnnotations;

namespace StoreApi.Features.Notification
{
    public class NotificationRequestDTO
    {
        [Required]
        public int SenderUserID { get; set; }

        [Required]
        public int SenderRoleID { get; set; }

        [Required]
        [StringLength(500)]
        public string NotificationString { get; set; } = string.Empty;

        public string NotificationType { get; set; } = "OrderStatus";

        public int? ReferenceID { get; set; }

        public string? ReferenceType { get; set; }

        public List<int> TargetRoleIDs { get; set; } = new();
    }
}