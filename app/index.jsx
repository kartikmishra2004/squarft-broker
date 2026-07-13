import { Redirect } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
    const { token } = useSelector((state) => state.auth);
    const isLoggedIn = !!token;

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }
    return <Redirect href="/(auth)/login" />;
}
