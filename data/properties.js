import { MaterialCommunityIcons } from "@expo/vector-icons";

const commonCategories = [
  { id: "house", name: "House", icon: "home-outline", library: MaterialCommunityIcons },
  { id: "plots", name: "Plots", icon: "home-city-outline", library: MaterialCommunityIcons },
  { id: "lands", name: "Lands", icon: "map-outline", library: MaterialCommunityIcons },
  { id: "warehouse", name: "Warehouse", icon: "warehouse", library: MaterialCommunityIcons },
  { id: "flats", name: "Flats", icon: "office-building-outline", library: MaterialCommunityIcons },
  { id: "store", name: "Store", icon: "store-outline", library: MaterialCommunityIcons },
];


export const categoriesData = {
  SELL: commonCategories,
  RENT: commonCategories,
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
  },
  {
    id: 2,
    title: "Eco Greens",
    developer: "by Eco Builders",
    description: "Agriculture Land for Farming\nNear Indore Bypass....",
    price: "₹1.2 Cr - 5 Cr",
    image: require("../assets/images/home/hero.png"),
    type: "SELL",
  },
];

