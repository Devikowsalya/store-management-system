using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using StoreApi.Features.User;

namespace StoreApi.Features.Notification
{
    [Table("Notifications")]
    public class NotificationModal
    {
        [Key]
        public int NotificationID { get; set; }

        public int SenderUserID { get; set; }

        public int SenderRoleID { get; set; }

        [Required]
        [StringLength(500)]
        public string NotificationString { get; set; } = string.Empty;

        [StringLength(50)]
        public string NotificationType { get; set; } = "OrderStatus";

        public int? ReferenceID { get; set; }

        [StringLength(50)]
        public string? ReferenceType { get; set; }

        // Role IDs allowed to receive this notification
        public List<int> TargetRoleIDs { get; set; } = [];

        // User IDs who have already read it
        public List<int> ReadByUserIDs { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(SenderUserID))]
        public UserModal SenderUser { get; set; } = null!;
    }
}