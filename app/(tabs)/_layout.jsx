import { Tabs, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, View  } from "react-native";
import { Image } from "expo-image";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import KycModal from "../../components/KycModal";
import { clearCurrentItem } from "../../store/slices/myAddedSlice";
import { resetProject } from "../../store/slices/projectSlice";

const TAB_COLOR = "#4A43EC";
const MUTED_TAB_COLOR = "#94A3B8";

const tabIcons = {
    home: ["home", "home-outline"],
    favourite: ["albums", "albums-outline"],
    addProject: ["add-circle", "add-circle-outline"],
    discount: ["cash", "cash-outline"],
    settings: ["settings", "settings-outline"],
};

function TabIcon({ name, focused }) {
    const [activeIcon, inactiveIcon] = tabIcons[name];
    const iconName = focused ? activeIcon : inactiveIcon;
    const scale = useRef(new Animated.Value(focused ? 1 : 0.94)).current;
    const translateY = useRef(new Animated.Value(focused ? -2 : 0)).current;

    useEffect(() => {
        if (focused) {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, { toValue: 1.18, duration: 120, useNativeDriver: true }),
                    Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(translateY, { toValue: -5, duration: 120, useNativeDriver: true }),
                    Animated.spring(translateY, { toValue: -2, friction: 5, tension: 120, useNativeDriver: true }),
                ]),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(scale, { toValue: 0.94, duration: 120, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start();
    }, [focused, scale, translateY]);

    return (
        <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
            <Ionicons name={iconName} size={24} color={focused ? TAB_COLOR : MUTED_TAB_COLOR} />
        </Animated.View>
    );
}

export default function TabsLayout() {
    const router = useRouter();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const androidBottomInset = Platform.OS === "android" ? Math.max(insets.bottom, 0) : 0;
    const iosBottomPadding = Platform.OS === "ios" ? Math.max(insets.bottom - 8, 6) : 8;
    const openFreshAddProject = () => {
        dispatch(resetProject());
        dispatch(clearCurrentItem());
        router.replace(`/(tabs)/addProject?mode=add&itemId=&itemType=&fresh=${Date.now()}`);
    };

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: TAB_COLOR,
                    tabBarInactiveTintColor: MUTED_TAB_COLOR,
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontFamily: "Lato-Bold",
                        marginTop: 2,
                    },
                    tabBarItemStyle: {
                        paddingTop: 3,
                    },
                    tabBarStyle: {
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: -1,
                        borderTopRightRadius: 45,
                        borderTopLeftRadius: 45,
                        borderTopColor: "transparent",
                        backgroundColor: "#fff",
                        paddingTop: 12,
                        paddingHorizontal: 15,
                        paddingBottom: Platform.OS === "ios" ? iosBottomPadding : Math.max(androidBottomInset, 0),
                        height: Platform.OS === "ios" ? 88 : 82 + androidBottomInset,
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
                        tabBarLabel: "Home",
                        tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="favourite"
                    options={{
                        headerShown: false,
                        tabBarLabel: "My Added",
                        tabBarIcon: ({ focused }) => <TabIcon name="favourite" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="addProject"
                    options={{
                        headerShown: false,
                        tabBarLabel: "Add",
                        tabBarIcon: ({ focused }) => <TabIcon name="addProject" focused={focused} />,
                        tabBarButton: (props) => (
                            <Pressable
                                {...props}
                                onPress={openFreshAddProject}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="discount"
                    options={{
                        headerShown: false,
                        tabBarLabel: "Earnings",
                        tabBarIcon: ({ focused }) => <TabIcon name="discount" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        headerShown: false,
                        tabBarLabel: "Settings",
                        tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                    }}
                />
            </Tabs>
            <KycModal />
        </>
    );
}
