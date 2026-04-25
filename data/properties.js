import { MaterialCommunityIcons } from "@expo/vector-icons";

const commonCategories = [
  { id: "house", name: "House", image: require("../assets/icons/property-types/house.png") },
  { id: "plots", name: "Plots", image: require("../assets/icons/property-types/plots.png") },
  { id: "lands", name: "Lands", image: require("../assets/icons/property-types/lands.png") },
  { id: "warehouse", name: "Warehouse", image: require("../assets/icons/property-types/warehouse.png") },
  { id: "flats", name: "Flats", image: require("../assets/icons/property-types/flats.png") },
  { id: "store", name: "Store", image: require("../assets/icons/property-types/store.png") },
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

