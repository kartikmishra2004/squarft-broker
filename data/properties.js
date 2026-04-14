import { MaterialCommunityIcons } from "@expo/vector-icons";

export const categoriesData = {
  SELL: {
    Residential: [
      { name: "Apartment", icon: "office-building-outline", library: MaterialCommunityIcons },
      { name: "Builder Floor", icon: "layers-outline", library: MaterialCommunityIcons },
      { name: "House/Villa", icon: "home-outline", library: MaterialCommunityIcons },
      { name: "Plot", icon: "home-city-outline", library: MaterialCommunityIcons },
      { name: "Other", icon: "dots-horizontal", library: MaterialCommunityIcons },
    ],
    Commercial: [
      { name: "Plot", icon: "home-city-outline", library: MaterialCommunityIcons },
      { name: "Office", icon: "briefcase-outline", library: MaterialCommunityIcons },
      { name: "Shop", icon: "store-outline", library: MaterialCommunityIcons },
      { name: "Storage", icon: "warehouse", library: MaterialCommunityIcons },
      { name: "Industry", icon: "factory", library: MaterialCommunityIcons },
      { name: "Hospitality", icon: "silverware-fork-knife", library: MaterialCommunityIcons },
      { name: "Other", icon: "dots-horizontal", library: MaterialCommunityIcons },
    ],
    Agriculture: [
      { name: "Land", icon: "tent", library: MaterialCommunityIcons },
      { name: "Farmhouse", icon: "home-outline", library: MaterialCommunityIcons },
    ],
  },
  RENT: {
    Residential: [
      { name: "Apartment", icon: "office-building-outline", library: MaterialCommunityIcons },
      { name: "Builder Floor", icon: "layers-outline", library: MaterialCommunityIcons },
      { name: "House/Villa", icon: "home-outline", library: MaterialCommunityIcons },
      { name: "Plot", icon: "home-city-outline", library: MaterialCommunityIcons },
      { name: "Other", icon: "dots-horizontal", library: MaterialCommunityIcons },
    ],
    Commercial: [
      { name: "Plot", icon: "home-city-outline", library: MaterialCommunityIcons },
      { name: "Office", icon: "briefcase-outline", library: MaterialCommunityIcons },
      { name: "Shop", icon: "store-outline", library: MaterialCommunityIcons },
      { name: "Storage", icon: "warehouse", library: MaterialCommunityIcons },
      { name: "Industry", icon: "factory", library: MaterialCommunityIcons },
      { name: "Hospitality", icon: "silverware-fork-knife", library: MaterialCommunityIcons },
      { name: "Other", icon: "dots-horizontal", library: MaterialCommunityIcons },
    ],
    Agriculture: [
      { name: "Land", icon: "tent", library: MaterialCommunityIcons },
      { name: "Farmhouse", icon: "home-outline", library: MaterialCommunityIcons },
    ],
  }
};

export const upcomingProjectsData = [
  {
    id: 1,
    title: "Fortune Florence",
    developer: "by Fortune Group",
    description: "2, 2.5, 3 BHK Apartements\nScheme 68 near vijay nagar....",
    price: "₹35.00 L - 2.5 Cr",
    image: require("../assets/images/home/hero.png"),
    type: "SELL",
    subType: "Residential"
  },
  {
    id: 2,
    title: "Eco Greens",
    developer: "by Eco Builders",
    description: "Agriculture Land for Farming\nNear Indore Bypass....",
    price: "₹1.2 Cr - 5 Cr",
    image: require("../assets/images/home/hero.png"),
    type: "SELL",
    subType: "Agriculture"
  },
];
