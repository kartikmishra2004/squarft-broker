export const initialNotifications = [
  {
    id: 1,
    title: "New Customer Assigned",
    description: "A new customer has been assigned to you for a property visit. Check the details now.",
    time: "02 Apr 2025",
    type: "customer",
    watched: false,
  },
  {
    id: 2,
    title: "Property Approved!",
    description: "Your property has been approved by the admin!",
    time: "06:15 PM",
    type: "success",
    watched: false,
  },
  {
    id: 3,
    title: "Listing Not Approved!",
    description: "Your property was rejected by admin. Please review and update the details.",
    time: "02 Apr 2025",
    type: "error",
    watched: true,
  },
  {
    id: 4,
    title: "Thank you!",
    description: "We'll notify you once the admin has reviewed your property.",
    time: "03 Apr 2025",
    type: "love",
    watched: false,
  },
];
