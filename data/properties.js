import { MaterialCommunityIcons } from "@expo/vector-icons";

const commonCategories = [
  { id: "villa", name: "Villa", image: require("../assets/images/villa.png") },
  { id: "plots", name: "Plots", image: require("../assets/images/plot.png") },
  { id: "apartment", name: "Apartment", image: require("../assets/images/apartment.png") },
  { id: "rowhouse", name: "Rowhouse", image: require("../assets/images/rowhouse.png") },
  { id: "office", name: "Office", image: require("../assets/images/office.png") },
  { id: "shop", name: "Shop", image: require("../assets/images/Shop.png") },
    { id: "showroom", name: "Showroom", image: require("../assets/images/showroom.png") },
];


export const categoriesData = {
  SELL: commonCategories,
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

