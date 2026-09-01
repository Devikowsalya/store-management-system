namespace StoreApi.Features.Notification
{
    public class NotificationResponseDTO
    {
        public int NotificationID { get; set; }

        public int SenderUserID { get; set; }

        public int SenderRoleID { get; set; }

        public string NotificationString { get; set; } = string.Empty;

        public string NotificationType { get; set; } = string.Empty;

        public int? ReferenceID { get; set; }

        public string? ReferenceType { get; set; }

        public List<int> TargetRoleIDs { get; set; } = new();

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}