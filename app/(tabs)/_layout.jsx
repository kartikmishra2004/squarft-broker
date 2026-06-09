import { Tabs, useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import KycModal from "../../components/KycModal";

const icons = {
    home: {
        inactive: require("../../assets/icons/tabs/home.png"),
        active: require("../../assets/icons/tabs/home-active.png"),
    },
    favourite: {
        inactive: require("../../assets/icons/tabs/fav.png"),
        active: require("../../assets/icons/tabs/fav-active.png"),
    },
    addProject: {
        inactive: require("../../assets/icons/tabs/book.png"),
        active: require("../../assets/icons/tabs/book-active.png"),
    },
    discount: {
        inactive: require("../../assets/icons/tabs/discount.png"),
        active: require("../../assets/icons/tabs/discount-active.png"),
    },
    settings: {
        inactive: require("../../assets/icons/tabs/settings.png"),
        active: require("../../assets/icons/tabs/settings-active.png"),
    },
};

function TabIcon({ name, focused, size }) {
    if (name === "addProject") {
        return (
            <View 
                style={{ 
                    width: 56, 
                    height: 56, 
                    backgroundColor: "#4A43EC", 
                    borderRadius: 28, 
                    justifyContent: "center", 
                    itemsCenter: "center",
                    position: "absolute",
                    bottom: 10,
                    elevation: 5,
                    shadowColor: "#4A43EC",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                }}
                className="items-center justify-center"
            >
                <Ionicons name="add" size={32} color="white" />
            </View>
        );
    }
    const icon = icons[name];
    const activeSize = size?.active ?? { width: 44, height: 44 };
    const inactiveSize = size?.inactive ?? { width: 24, height: 24 };
    return (
        <Image
            source={focused ? icon.active : icon.inactive}
            style={[focused ? activeSize : inactiveSize]}
            contentFit="contain"
            transition={0}
        />
    );
}

export default function TabsLayout() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const androidBottomInset = Platform.OS === "android" ? Math.max(insets.bottom, 0) : 0;
    const iosBottomPadding = Platform.OS === "ios" ? Math.max(insets.bottom - 8, 6) : 8;

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: -1,
                        borderTopRightRadius: 45,
                        borderTopLeftRadius: 45,
                        borderTopColor: "transparent",
                        backgroundColor: "#fff",
                        paddingTop: 15,
                        paddingHorizontal: 15,
                        paddingBottom: Platform.OS === "ios" ? iosBottomPadding : Math.max(androidBottomInset, 0),
                        height: Platform.OS === "ios" ? 85 : 65 + androidBottomInset,
                        ...Platform.select({
                            ios: {
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 4,
                            },
                            android: {
                                elevation: 10,
                            },
                        }),
                    },
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="favourite"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => <TabIcon name="favourite" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="addProject"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                name="addProject"
                                focused={focused}
                                size={{
                                    active: { width: 56, height: 56, position: "absolute", bottom: 0 },
                                    inactive: { width: 56, height: 56, position: "absolute", bottom: 0 },
                                }}
                            />
                        ),
                        listeners: () => ({
                            tabPress: (e) => {
                                e.preventDefault();
                                router.replace("/(tabs)/addProject");
                            },
                        }),
                    }}
                />
                <Tabs.Screen
                    name="discount"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => <TabIcon name="discount" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                    }}
                />
            </Tabs>
            <KycModal />
        </>
    );
}