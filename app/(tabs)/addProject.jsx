import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import {
    createBasicDetails,
    updateOwnerDetails,
    updatePropertyDetails,
    updateAreaDetails,
    updatePricingDetails,
    uploadProjectMedia,
    resetProject,
} from "../../store/slices/projectSlice";
import { sendOtpApi, verifyOtpApi } from "../../store/slices/authSlice";
import { clearCurrentItem } from "../../store/slices/myAddedSlice";
import { clearPickedLocation } from "../../store/slices/locationSlice";
import { clearPickedNearbyProject } from "../../store/slices/propertySlice";
import { notifyPropertyUploaded } from "../../utils/notificationHelpers";

const { width } = Dimensions.get("window");
const DEFAULT_NEARBY_LATITUDE = 23.2599;
const DEFAULT_NEARBY_LONGITUDE = 77.4126;
const DEFAULT_NEARBY_RADIUS = 10;

const firstParam = (value, fallback = "") => Array.isArray(value) ? value[0] || fallback : value || fallback;

const steps = [
    { id: 1, title: "Basic Details" },
    { id: 2, title: "Owner Detail" },
    { id: 3, title: "Property Detail" },
    { id: 4, title: "Image & Price" },
];

const mainTypes = [
    {
        id: "residential",
        label: "Residential",
        image: require("../../assets/icons/property-types/House2.png"),
        cloudImage: require("../../assets/icons/property-types/Clouds.png"),
    },
    {
        id: "commercial",
        label: "Commercial",
        image: require("../../assets/icons/property-types/commercial.png"),
    },
];

const subTypesData = {
    residential: [
        { id: "plot", label: "Plot", image: require("../../assets/icons/property-types/plot.png") },
        { id: "villa", label: "Villa", image: require("../../assets/icons/property-types/villa.png") },
        { id: "apartment", label: "Apartment", image: require("../../assets/icons/property-types/apartment.png") },
        { id: "rowhouse", label: "Rowhouse", image: require("../../assets/icons/property-types/rowhouse.png") },
    ],
    commercial: [
        { id: "shop", label: "Shop", image: require("../../assets/icons/property-types/Shop.png") },
        { id: "showroom", label: "Showroom", image: require("../../assets/icons/property-types/showroom.png") },
        { id: "office", label: "Office", image: require("../../assets/icons/property-types/office.png") },
    ]
};

const propertyKinds = [
    { id: "ready", label: "Ready To Move" },
    { id: "bare", label: "Bare Shell" },
    { id: "coworking", label: "Co-Working" },
];

const bhkOptions = [
    { id: "1_bhk", label: "1 BHK" },
    { id: "2_bhk", label: "2 BHK" },
    { id: "3_bhk", label: "3 BHK" },
    { id: "4_bhk", label: "4 BHK" },
    { id: "5_bhk", label: "5 BHK" },
    { id: "5_plus_bhk", label: "5 BHK+" },
];

const bhkSubTypes = ["plot", "villa", "apartment", "rowhouse"];

const areaUnits = [
    { id: "sqft", label: "Square Feet (sq ft)", short: "sq ft" },
    { id: "sqm", label: "Square Meter (sq m)", short: "sq m" },
    { id: "acre", label: "Acre", short: "Acre" },
    { id: "hectare", label: "Hectare", short: "Hect" },
    { id: "gaj", label: "Square Yard (gaj)", short: "Gaj" },
    { id: "bigha", label: "Bigha", short: "Bigh" },
    { id: "biswa", label: "Biswa", short: "Bisw" },
    { id: "katha", label: "Katha / Kattha", short: "Kath" },
    { id: "guntha", label: "Guntha", short: "Gunt" },
    { id: "cent", label: "Cent", short: "Cent" },
    { id: "kanal", label: "Kanal", short: "Kana" },
    { id: "marla", label: "Marla", short: "Marl" },
    { id: "ankanam", label: "Ankanam", short: "Anka" },
    { id: "decimal", label: "Decimal", short: "Deci" },
];

export default function AddProject() {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const { currentProjectId, loading: projectLoading, error: projectError, submitSuccess } = useSelector(state => state.project);
    const currentItem = useSelector(state => state.myAdded?.currentItem);
    const pickedLocation = useSelector(state => state.location?.pickedLocation);
    const pickedNearbyProject = useSelector(state => state.property?.pickedNearbyProject);

    const routeMode = firstParam(params.mode, "add");
    const editItemId = firstParam(params.itemId);
    const editItemType = firstParam(params.itemType); // 'property' or 'project'
    const currentItemId = currentItem?.id ? String(currentItem.id) : "";

    // Edit mode is valid only when route params and loaded item agree.
    const isEditMode = routeMode === 'edit' && !!editItemId && currentItemId === String(editItemId);

    console.log('=== AddProject Mount ===');
    console.log('Edit Mode:', isEditMode);
    console.log('Edit Item ID:', editItemId);
    console.log('Edit Item Type:', editItemType);
    console.log('Current Item:', currentItem ? 'Loaded' : 'Not Loaded');
    console.log('========================');

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedMainType, setSelectedMainType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);
    const [selectedKind, setSelectedKind] = useState("ready");
    const [selectedBhk, setSelectedBhk] = useState("1bhk");
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [paymentMode, setPaymentMode] = useState("full");
    const [priceNegotiable, setPriceNegotiable] = useState(false);
    const [taxExclude, setTaxExclude] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [ownerOtpToken, setOwnerOtpToken] = useState(null);
    const [ownerOtpContact, setOwnerOtpContact] = useState("");
    const [verifiedOwnerContact, setVerifiedOwnerContact] = useState("");
    const [sendingOwnerOtp, setSendingOwnerOtp] = useState(false);
    const [verifyingOwnerOtp, setVerifyingOwnerOtp] = useState(false);
    const otpRefs = useRef([]);

    // Step 2 form state
    const [ownerName, setOwnerName] = useState("");
    const [ownerContact, setOwnerContact] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [ownerAddress, setOwnerAddress] = useState("");
    const [ownerAddressLatitude, setOwnerAddressLatitude] = useState(null);
    const [ownerAddressLongitude, setOwnerAddressLongitude] = useState(null);

    // Step 3 form state
    const [propertyName, setPropertyName] = useState("");
    const [towerNumber, setTowerNumber] = useState("");
    const [flatNumber, setFlatNumber] = useState("");
    const [locationText, setLocationText] = useState("");
    const [city, setCity] = useState("");
    const [stateText, setStateText] = useState("");
    const [pincode, setPincode] = useState("");
    const [propertyLatitude, setPropertyLatitude] = useState(null);
    const [propertyLongitude, setPropertyLongitude] = useState(null);
    const [nearbyProject, setNearbyProject] = useState("");
    const [khasraNumber, setKhasraNumber] = useState("");
    const [propertyAge, setPropertyAge] = useState("");
    const [totalAreaValue, setTotalAreaValue] = useState("");
    const [carpetAreaValue, setCarpetAreaValue] = useState("");

    // Step 4 form state
    const [sellingPrice, setSellingPrice] = useState("");

    // ✅ FIXED: Clear state functions safely when user transitions from edit back to add workflows
    const handleResetAllLocalFields = useCallback(() => {
        setCurrentStep(1);
        setSelectedMainType(null);
        setSelectedSubType(null);
        setSelectedKind("ready");
        setSelectedBhk("1bhk");
        setOwnerName("");
        setOwnerContact("");
        setOwnerOtpToken(null);
        setOwnerOtpContact("");
        setVerifiedOwnerContact("");
        setOtp(["", "", "", "", "", ""]);
        setOwnerEmail("");
        setOwnerAddress("");
        setOwnerAddressLatitude(null);
        setOwnerAddressLongitude(null);
        setPropertyName("");
        setTowerNumber("");
        setFlatNumber("");
        setLocationText("");
        setCity("");
        setStateText("");
        setPincode("");
        setPropertyLatitude(null);
        setPropertyLongitude(null);
        setNearbyProject("");
        setKhasraNumber("");
        setPropertyAge("");
        setTotalAreaValue("");
        setCarpetAreaValue("");
        setSellingPrice("");
        setPriceNegotiable(false);
        setTaxExclude(false);
        setAgreed(false);
        setUploadedImages([]);
        setUploadedDocs([]);
    }, []);

    // Clear currentItem when NOT in edit mode
    useEffect(() => {
        if (!isEditMode) {
            console.log('🧹 [AddProject] Not in edit mode - clearing currentItem from Redux and local fields');
            dispatch(clearCurrentItem());
            handleResetAllLocalFields();
        }
    }, [isEditMode, dispatch, handleResetAllLocalFields]);

    // State to track if we're returning from location/nearby picker
    const isReturningFromPicker = useRef(false);

    useEffect(() => {
        // Mark that we're returning from picker if pickedLocation or pickedNearbyProject exists
        if (pickedLocation || pickedNearbyProject) {
            console.log('🔄 [AddProject] Detected picker data - marking as returning from picker');
            console.log('  - pickedLocation:', !!pickedLocation);
            console.log('  - pickedNearbyProject:', !!pickedNearbyProject);
            isReturningFromPicker.current = true;
        }
    }, [pickedLocation, pickedNearbyProject]);

    useFocusEffect(
        useCallback(() => {
            console.log('👁️ [AddProject] useFocusEffect triggered');
            console.log('  - isReturningFromPicker:', isReturningFromPicker.current);
            console.log('  - routeMode:', routeMode);
            
            // Don't reset if returning from location/nearby picker
            if (isReturningFromPicker.current) {
                console.log("✅ [AddProject] Returning from picker - preserving state");
                isReturningFromPicker.current = false;
                return;
            }

            if (routeMode !== "edit") {
                console.log("🧹 [AddProject] Focused in add mode - clearing stale edit state");
                dispatch(resetProject());
                dispatch(clearCurrentItem());
                handleResetAllLocalFields();
            }
        }, [dispatch, handleResetAllLocalFields, routeMode])
    );

    // CLEANUP: Reset project and myAdded state when component unmounts
    useEffect(() => {
        return () => {
            console.log('🧹 [AddProject] Component unmounting - cleaning up Redux state');
            dispatch(resetProject());
            dispatch(clearCurrentItem());
        };
    }, [dispatch]);

    // Load existing data in edit mode
    useEffect(() => {
        console.log('🔄 [Edit Data Load useEffect] Triggered');
        console.log('  - isEditMode:', isEditMode);
        console.log('  - currentItem exists:', !!currentItem);
        console.log('  - editItemType:', editItemType);
        
        if (isEditMode && currentItem) {
            console.log('=== EDIT MODE: Loading data ===');
            console.log('Item Type:', editItemType);
            console.log('Current Item FULL DATA:', JSON.stringify(currentItem, null, 2));
            
            console.log('currentItem:', currentItem);
            console.log('Available fields:', Object.keys(currentItem));
            console.log('type:', currentItem.type);
            console.log('sub_type:', currentItem.sub_type);
            console.log('kind_of_property:', currentItem.kind_of_property);
            console.log('title:', currentItem.title);
            console.log('city:', currentItem.city);

            const categoryValue = currentItem.type || currentItem.category || null;
            setSelectedMainType(categoryValue);

            const subTypeValue = currentItem.sub_type || currentItem.property_type || null;
            setSelectedSubType(subTypeValue);

            const storedBhk = currentItem.description || currentItem.kind_of_property;
            if (storedBhk) {
                if (storedBhk.includes('bhk') || storedBhk.includes('_bhk')) {
                    setSelectedBhk(storedBhk);
                } else {
                    setSelectedKind(currentItem.kind_of_property);
                }
            }

            const ownerNameValue = currentItem.owner_name || currentItem.title || currentItem.name || "";
            setOwnerName(ownerNameValue);
            setOwnerContact(currentItem.owner_contact || currentItem.contact_no || "");  
            setOwnerOtpToken(null);
            setOwnerOtpContact("");
            setVerifiedOwnerContact("");
            setOtp(["", "", "", "", "", ""]);
            setOwnerEmail(currentItem.owner_email || currentItem.contact_email || "");   
            setOwnerAddress(currentItem.owner_address || "");
            setOwnerAddressLatitude(currentItem.owner_latitude || null);
            setOwnerAddressLongitude(currentItem.owner_longitude || null);

            const propertyNameValue = currentItem.title || currentItem.name || currentItem.property_name || "";
            setPropertyName(propertyNameValue);
            setTowerNumber(currentItem.tower_number || currentItem.tower_no?.toString() || "");  
            setFlatNumber(currentItem.flat_number || currentItem.flat_no?.toString() || "");    
            setLocationText(currentItem.location || currentItem.address || currentItem.area || "");
            setCity(currentItem.city || "");
            setStateText(currentItem.state || "");
            setPincode(currentItem.pincode || "");
            setPropertyLatitude(currentItem.latitude || null);
            setPropertyLongitude(currentItem.longitude || null);
            setNearbyProject(currentItem.nearby_project || "");
            setKhasraNumber(currentItem.khasra_number || currentItem.khasra_no || "");  
            setPropertyAge(currentItem.property_age?.toString() || "");

            const totalArea = currentItem.total_area_sqft?.toString() || currentItem.total_area?.toString() || "";
            setTotalAreaValue(totalArea);
            setCarpetAreaValue(currentItem.carpet_area?.toString() || "");

            if (currentItem.area_unit) {
                const foundUnit = areaUnits.find(u => u.id === currentItem.area_unit);
                if (foundUnit) {
                    setTotalAreaUnit(foundUnit);
                    setCarpetAreaUnit(foundUnit);
                }
            }

            const priceValue = currentItem.base_price?.toString() || 
                               currentItem.selling_price?.toString() || 
                               currentItem.price_from?.toString() ||
                               currentItem.min_price?.toString() || "";
            setSellingPrice(priceValue);
            setPriceNegotiable(currentItem.is_negotiable || false);
            setTaxExclude(currentItem.tax_excluded || !currentItem.tax_included || false);

            if (currentItem.media && Array.isArray(currentItem.media)) {
                const images = currentItem.media
                    .filter(m => m.media_type === 'image')
                    .map(m => ({ uri: m.url, id: m.id, ...m }));
                setUploadedImages(images);

                const docs = currentItem.media
                    .filter(m => m.media_type === 'document')
                    .map(m => ({ uri: m.url, name: m.label || 'Document', id: m.id, ...m }));
                setUploadedDocs(docs);
            }

            console.log('=== EDIT MODE DATA LOADED - Starting from Step 1 ===');
            setCurrentStep(1);
        }
    }, [isEditMode, currentItem, editItemType]);

    // Show error from project slice
    useEffect(() => {
        if (projectError) {
            Alert.alert("Error", projectError);
        }
    }, [projectError]);

    // On submit success
    useEffect(() => {
        if (submitSuccess) {
            Alert.alert("Success", "Property updated successfully!", [
                { 
                    text: "OK", 
                    onPress: () => { 
                        dispatch(resetProject()); 
                        // Check if we can go back, otherwise navigate to home
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(tabs)/home');
                        }
                    } 
                }
            ]);
        }
    }, [dispatch, submitSuccess]);

    useEffect(() => {
        if (!pickedLocation) return;

        if (pickedLocation.target === "owner_address") {
            setOwnerAddress(pickedLocation.address || "");
            setOwnerAddressLatitude(pickedLocation.latitude);
            setOwnerAddressLongitude(pickedLocation.longitude);
        }

        if (pickedLocation.target === "property_location") {
            setLocationText(pickedLocation.address || "");
            setPropertyLatitude(pickedLocation.latitude);
            setPropertyLongitude(pickedLocation.longitude);
            if (pickedLocation.city) setCity(pickedLocation.city);
            if (pickedLocation.state) setStateText(pickedLocation.state);
            if (pickedLocation.pincode) setPincode(pickedLocation.pincode);
        }

        dispatch(clearPickedLocation());
    }, [dispatch, pickedLocation]);

    useEffect(() => {
        if (!pickedNearbyProject) return;

        setNearbyProject(pickedNearbyProject.name || "");
        dispatch(clearPickedNearbyProject());
    }, [dispatch, pickedNearbyProject]);

    // Area unit state
    const [totalAreaUnit, setTotalAreaUnit] = useState(areaUnits[0]);
    const [carpetAreaUnit, setCarpetAreaUnit] = useState(areaUnits[0]);
    const [activeUnitTarget, setActiveUnitTarget] = useState(null); // 'total' | 'carpet'
    const unitSheetRef = useRef(null);
    const uploadSheetRef = useRef(null);

    const openUnitSheet = useCallback((target) => {
        setActiveUnitTarget(target);
        unitSheetRef.current?.present();
    }, []);

    const selectUnit = useCallback((unit) => {
        if (activeUnitTarget === "total") setTotalAreaUnit(unit);
        else setCarpetAreaUnit(unit);
        unitSheetRef.current?.dismiss();
    }, [activeUnitTarget]);

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ), []);

    // Upload state
    const [pickerModal, setPickerModal] = useState(null); // null | 'image' | 'document'
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === "granted";
    };

    const pickFromGallery = async () => {
        try {
            if (pickerModal === "document") {
                const result = await DocumentPicker.getDocumentAsync({
                    type: "*/*",
                    multiple: true,
                    copyToCacheDirectory: true,
                });
                uploadSheetRef.current?.dismiss();
                setPickerModal(null);
                if (!result.canceled) {
                    setUploadedDocs(prev => [...prev, ...result.assets]);
                }
                return;
            }
            const granted = await requestPermission();
            if (!granted) return;
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsMultipleSelection: true,
                quality: 0.8,
            });
            uploadSheetRef.current?.dismiss();
            setPickerModal(null);
            if (!result.canceled && result.assets) {
                setUploadedImages(prev => [...prev, ...result.assets]);
            }
        } catch (error) {
            console.error('[AddProject] Gallery picker error:', error);
            uploadSheetRef.current?.dismiss();
            setPickerModal(null);
            Alert.alert(
                'Image Picker Error',
                'Unable to access gallery. Please check app permissions in Settings.',
                [{ text: 'OK' }]
            );
        }
    };

    const pickFromCamera = async () => {
        try {
            if (pickerModal === "document") return; // no camera for documents
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") return;
            const result = await ImagePicker.launchCameraAsync({ 
                quality: 0.8,
                mediaTypes: 'images',
            });
            uploadSheetRef.current?.dismiss();
            setPickerModal(null);
            if (!result.canceled && result.assets) {
                setUploadedImages(prev => [...prev, ...result.assets]);
            }
        } catch (error) {
            console.error('[AddProject] Camera picker error:', error);
            uploadSheetRef.current?.dismiss();
            setPickerModal(null);
            Alert.alert(
                'Camera Error',
                'Unable to access camera. Please check app permissions in Settings.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleOtpChange = (text, index) => {
        const digit = text.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < otp.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const cleanOwnerPhone = useCallback(() => ownerContact.trim().replace(/\D/g, ""), [ownerContact]);

    const handleOwnerContactChange = useCallback((text) => {
        setOwnerContact(text);
        setOwnerOtpToken(null);
        setOwnerOtpContact("");
        setVerifiedOwnerContact("");
        setOtp(["", "", "", "", "", ""]);
    }, []);

    const sendOwnerOtp = useCallback(async () => {
        const phone = cleanOwnerPhone();
        if (phone.length < 10) {
            Alert.alert("OTP", "Enter a valid owner contact number.");
            return;
        }

        try {
            setSendingOwnerOtp(true);
            const response = await dispatch(sendOtpApi({ phone, purpose: "owner_contact" })).unwrap();
            setOwnerOtpToken(response.otp_token);
            setOwnerOtpContact(phone);
            setVerifiedOwnerContact("");
            setOtp(["", "", "", "", "", ""]);
            setTimeout(() => otpRefs.current[0]?.focus(), 80);
            Alert.alert("OTP", "OTP sent to owner contact number.");
        } catch (error) {
            Alert.alert("OTP Failed", getErrorMessage(error));
        } finally {
            setSendingOwnerOtp(false);
        }
    }, [cleanOwnerPhone, dispatch]);

    const verifyOwnerOtp = useCallback(async () => {
        const phone = cleanOwnerPhone();
        const otpCode = otp.join("");

        if (!ownerOtpToken || ownerOtpContact !== phone) {
            Alert.alert("OTP", "Please send OTP to this owner contact first.");
            return false;
        }

        if (otpCode.length !== 6) {
            Alert.alert("OTP", "Please enter the 6-digit OTP.");
            return false;
        }

        try {
            setVerifyingOwnerOtp(true);
            const response = await dispatch(verifyOtpApi({ otp_token: ownerOtpToken, otp: otpCode })).unwrap();
            if (!response.verified) throw new Error("OTP verification failed.");
            setVerifiedOwnerContact(phone);
            setOwnerOtpToken(null);
            Alert.alert("OTP Verified", "Owner contact verified successfully.");
            return true;
        } catch (error) {
            Alert.alert("Invalid OTP", getErrorMessage(error));
            return false;
        } finally {
            setVerifyingOwnerOtp(false);
        }
    }, [cleanOwnerPhone, dispatch, otp, ownerOtpContact, ownerOtpToken]);

    const subTypes = selectedMainType ? (subTypesData[selectedMainType] || []) : [];
    const showBhk = selectedMainType === "residential" && selectedSubType && bhkSubTypes.includes(selectedSubType);
    const showKind = selectedMainType === "commercial" && selectedSubType === "office";

    const step1Valid = selectedMainType === "residential"
        ? !!selectedSubType
        : selectedMainType === "commercial"
            ? selectedSubType === "office" ? !!selectedKind : !!selectedSubType
            : false;

    const getActivePropertyId = useCallback(() => (
        isEditMode ? editItemId : currentProjectId
    ), [currentProjectId, editItemId, isEditMode]);

    const openLocationPicker = useCallback((target) => {
        const isOwnerTarget = target === "owner_address";
        router.push({
            pathname: "/(screens)/location-picker",
            params: {
                target,
                title: isOwnerTarget ? "Owner Address" : "Property Location",
                initialAddress: isOwnerTarget ? ownerAddress : locationText,
                initialLatitude: String((isOwnerTarget ? ownerAddressLatitude : propertyLatitude) || ""),
                initialLongitude: String((isOwnerTarget ? ownerAddressLongitude : propertyLongitude) || ""),
            },
        });
    }, [locationText, ownerAddress, ownerAddressLatitude, ownerAddressLongitude, propertyLatitude, propertyLongitude]);

    const openNearbyProjects = useCallback(() => {
        router.push({
            pathname: "/(screens)/nearby-projects",
            params: {
                latitude: String(propertyLatitude || DEFAULT_NEARBY_LATITUDE),
                longitude: String(propertyLongitude || DEFAULT_NEARBY_LONGITUDE),
                radius: String(DEFAULT_NEARBY_RADIUS),
            },
        });
    }, [propertyLatitude, propertyLongitude]);

    const getErrorMessage = (error) => {
        if (typeof error === "string") return error;
        return error?.message || "Something went wrong. Please try again.";
    };

    const saveOwnerDetails = useCallback(async (propertyId) => {
        const cleanOwnerName = ownerName.trim();
        const cleanOwnerContact = ownerContact.trim().replace(/\s+/g, "");
        const cleanPropertyName = propertyName.trim();

        if (!propertyId) {
            throw new Error("Property ID is missing.");
        }

        if (!cleanOwnerName || !cleanOwnerContact) {
            throw new Error("Owner name and contact are required.");
        }

        await dispatch(updateOwnerDetails({
            projectId: propertyId,
            title: cleanPropertyName || cleanOwnerName,
            owner_name: cleanOwnerName,
            owner_contact: cleanOwnerContact,
            owner_email: ownerEmail.trim() || undefined,
            owner_address: ownerAddress.trim() || undefined,
        })).unwrap();
    }, [dispatch, ownerAddress, ownerContact, ownerEmail, ownerName, propertyName]);

    const savePropertyDetails = useCallback(async (propertyId) => {
        if (!propertyId) {
            throw new Error("Property ID is missing.");
        }

        if (!city.trim() || !stateText.trim()) {
            throw new Error("City and State are required.");
        }

        await dispatch(updatePropertyDetails({
            projectId: propertyId,
            name: propertyName.trim() || undefined,
            tower_number: towerNumber.trim() || undefined,
            flat_number: flatNumber.trim() || undefined,
            location: locationText.trim() || undefined,
            city: city.trim(),
            area: locationText.trim() || undefined,
            state: stateText.trim(),
            pincode: pincode.trim() || undefined,
            latitude: propertyLatitude,
            longitude: propertyLongitude,
            nearby_project: nearbyProject.trim() || undefined,
            khasra_number: khasraNumber.trim() || undefined,
            property_age: propertyAge ? Number(propertyAge) : undefined,
            owner_contact: ownerContact.trim().replace(/\s+/g, "") || undefined,
            owner_email: ownerEmail.trim() || undefined,
        })).unwrap();
    }, [city, dispatch, flatNumber, khasraNumber, locationText, nearbyProject, ownerContact, ownerEmail, pincode, propertyAge, propertyLatitude, propertyLongitude, propertyName, stateText, towerNumber]);

    const saveAreaDetails = useCallback(async (propertyId) => {
        if (!totalAreaValue && !carpetAreaValue) return;

        await dispatch(updateAreaDetails({
            projectId: propertyId,
            total_area: totalAreaValue ? Number(totalAreaValue) : undefined,
            carpet_area: carpetAreaValue ? Number(carpetAreaValue) : undefined,
            area_unit: totalAreaUnit.id,
        })).unwrap();
    }, [carpetAreaValue, dispatch, totalAreaUnit.id, totalAreaValue]);

    useEffect(() => {
        console.log('🔄 [Reset SubType useEffect] Triggered - selectedMainType:', selectedMainType, 'isEditMode:', isEditMode);
        if (!isEditMode) {
            console.log('  ➡️  Resetting selectedSubType to null');
            setSelectedSubType(null);
        }
    }, [selectedMainType, isEditMode]);

    useEffect(() => {
        console.log('🔄 [Reset BHK/Kind useEffect] Triggered - selectedSubType:', selectedSubType, 'isEditMode:', isEditMode);
        if (!isEditMode) {
            console.log('  ➡️  Resetting selectedBhk and selectedKind');
            setSelectedBhk("1_bhk");
            setSelectedKind("ready");
        }
    }, [selectedSubType, isEditMode]);

    const scrollRef = useRef(null);

    useEffect(() => {
        setHasScrolledToBottom(false);
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [currentStep]);

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
        setHasScrolledToBottom(isAtBottom);
    };

    return (
        <View className="flex-1 bg-[#F8F9FE]">
            <StatusBar barStyle="light-content" />

            {/* Header Section */}
            <View className="bg-[#4A43EC] pt-12 pb-8 px-5 relative overflow-hidden">
                {/* Decorative Circle */}
                <View
                    style={{
                        position: "absolute",
                        right: -width * 0.5,
                        top: -width * 0.25,
                        width: width * 0.85,
                        height: width * 0.85,
                        borderRadius: width * 0.4,
                        backgroundColor: "#3D36C7",
                        opacity: 0.5
                    }}
                />

                <View className="flex-row items-center mt-6 justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => {
                            if (currentStep > 1) {
                                setCurrentStep(prev => prev - 1);
                            } else {
                                // Check if we can go back, otherwise navigate to home
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace('/(tabs)/home');
                                }
                            }
                        }}
                        className="p-1"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-base font-lato-bold">
                        {isEditMode ? "Edit Property" : "Add Properties"}
                    </Text>
                    <View style={{ width: 20 }} />
                </View>

                {/* Step Indicator */}
                <View className="flex-row justify-between items-start mt-8">
                    {steps.map((step, index) => (
                        <View key={step.id} className="items-center" style={{ width: (width - 40) / 4 }}>
                            <View
                                className={`w-7 h-7 rounded-full items-center justify-center mb-1.5 ${currentStep === step.id ? 'bg-white' : 'bg-transparent border border-white/40'
                                    }`}
                            >
                                <Text className={`text-xs font-lato-bold ${currentStep === step.id ? 'text-[#4A43EC]' : 'text-white/60'
                                    }`}>
                                    {step.id}
                                </Text>
                            </View>
                            <Text className={`text-[8px] text-center font-lato-medium ${currentStep === step.id ? 'text-white' : 'text-white/60'
                                }`} numberOfLines={1}>
                                {step.title}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Content Section */}
            <View className="flex-1 bg-white -mt-5 rounded-t-[20px] overflow-hidden">
                <ScrollView
                    ref={scrollRef}
                    className="flex-1 px-5 pt-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === 1 ? (
                        <>
                            {/* Main Property Type */}
                            <Text className="text-sm font-lato-bold text-black mb-3">Property Type</Text>
                            <View className="flex-row justify-between mb-8">
                                {mainTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setSelectedMainType(type.id)}
                                        style={{ width: (width - 50) / 2 }}
                                        className={`bg-white rounded-xl h-28 border ${selectedMainType === type.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-gray-100'
                                            } shadow-sm relative overflow-hidden`}
                                    >
                                        <Text className="text-xs font-lato-bold text-black absolute top-2.5 left-2.5 z-10">{type.label}</Text>

                                        <View className="flex-1 justify-end items-end">
                                            {type.cloudImage && (
                                                <Image
                                                    source={type.cloudImage}
                                                    className="absolute top-0 right-3 w-20 h-14 opacity-60"
                                                    resizeMode="contain"
                                                />
                                            )}
                                            <Image
                                                source={type.image}
                                                className="w-[80%] h-[70%] mt-auto"
                                                resizeMode="contain"
                                                style={{ marginBottom: -2, marginRight: -4 }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedMainType && (
                                <>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Property Type</Text>
                                    <View className="flex-row gap-3">
                                        {subTypes.map((type) => (
                                            <TouchableOpacity
                                                key={type.id}
                                                onPress={() => setSelectedSubType(type.id)}
                                                style={{ width: (width - 64) / 4 }}
                                                className={`bg-white rounded-lg h-20 border ${selectedSubType === type.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-gray-100'
                                                    } shadow-sm items-center overflow-hidden`}
                                            >
                                                <Text className={`text-[9px] font-lato-bold mt-1.5 mb-0.5 ${selectedSubType === type.id ? 'text-[#4A43EC]' : 'text-black'}`} numberOfLines={1}>{type.label}</Text>
                                                <View className="flex-1 w-full justify-end">
                                                    <Image
                                                        source={type.image}
                                                        className="w-full h-[80%]"
                                                        resizeMode="contain"
                                                        style={{ marginBottom: -1 }}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            {showBhk && (
                                <>
                                    <Text className="text-sm font-lato-bold text-black mt-8 mb-3">what kind of property?</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {bhkOptions.map((bhk) => (
                                            <TouchableOpacity
                                                key={bhk.id}
                                                onPress={() => setSelectedBhk(bhk.id)}
                                                className={`py-3 rounded-lg border items-center justify-center ${selectedBhk === bhk.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-[#fff] bg-white'}`}
                                                style={{ width: (width - 60) / 3, }}
                                            >
                                                <Text className={`text-[10px] font-lato-bold text-center ${selectedBhk === bhk.id ? 'text-[#4A43EC]' : 'text-gray-600'}`}>
                                                    {bhk.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            {showKind && (
                                <>
                                    <Text className="text-sm font-lato-bold text-black mt-8 mb-3"> of property?</Text>
                                    <View className="flex-row justify-between gap-2">
                                        {propertyKinds.map((kind) => (
                                            <TouchableOpacity
                                                key={kind.id}
                                                onPress={() => setSelectedKind(kind.id)}
                                                className={`flex-1 py-3 px-1 rounded-lg border items-center justify-center ${selectedKind === kind.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-zinc-300 bg-white'}`}
                                                style={{ elevation: 2 }}
                                            >
                                                <Text className={`text-[10px] font-lato-bold text-center ${selectedKind === kind.id ? 'text-[#4A43EC]' : 'text-gray-600'}`}>
                                                    {kind.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            {/* Next Button */}
                            <View className="mt-16 mb-4">
                                <TouchableOpacity
                                    className="py-4 rounded-xl items-center"
                                    style={{ backgroundColor: step1Valid ? "#4A43EC" : "#C5C3F5" }}
                                    activeOpacity={step1Valid ? 0.8 : 1}
                                    onPress={async () => {
                                        if (!step1Valid) return;
                                        
                                        if (isEditMode) {
                                            setCurrentStep(prev => prev + 1);
                                            return;
                                        }
                                        
                                        try {
                                            let kindOfProperty = null;
                                            let description = null;
                                            
                                            if (selectedMainType === "residential" && showBhk) {
                                                // For residential, don't set kind_of_property to BHK
                                                // Extract bedroom number from BHK selection (e.g., "3_bhk" -> 3, "5_plus_bhk" -> 5)
                                                description = selectedBhk;
                                            }
                                            else if (selectedMainType === "commercial" && showKind) {
                                                kindOfProperty = selectedKind;
                                            }
                                            
                                            const payload = {
                                                category: selectedMainType,
                                                property_type: selectedSubType,
                                                kind_of_property: kindOfProperty,
                                                description,
                                                listing_type: 'buy'
                                            };
                                            
                                            // Add bedrooms field if extracted from BHK
                                            console.log('📤 [AddProject] Creating basic details with payload:', payload);
                                            await dispatch(createBasicDetails(payload)).unwrap();
                                            setCurrentStep(prev => prev + 1);
                                        } catch (error) {
                                            console.error('❌ [AddProject] Create basic details error:', error);
                                            Alert.alert(
                                                "Error",
                                                getErrorMessage(error)
                                            );
                                        }
                                    }}
                                >
                                    <Text className="text-white text-sm font-lato-bold">Next</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : currentStep === 2 ? (
                        <View className="gap-7 pt-2">
                            {/* Owner Name */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3">Owner Name</Text>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                    placeholder="Enter Owner Name"
                                    placeholderTextColor="#c0c0c0ff"
                                    value={ownerName}
                                    onChangeText={setOwnerName}
                                AminityItem    />
                            </View>

                            {/* Owner Contact No. */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3">Owner Contact No.</Text>
                                <View className="flex-row bg-white border border-gray-300 rounded-xl px-4 py-1 items-center">
                                    <TextInput
                                        className="flex-1 text-sm text-gray-800 font-lato-medium"
                                        placeholder="eg. 8120180101"
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType="phone-pad"
                                        value={ownerContact}
                                        onChangeText={handleOwnerContactChange}
                                    />
                                    <TouchableOpacity
                                        onPress={sendOwnerOtp}
                                        disabled={sendingOwnerOtp}
                                        activeOpacity={0.75}
                                    >
                                        {sendingOwnerOtp
                                            ? <ActivityIndicator size="small" color="#4A43EC" />
                                            : <Text className="text-xs font-lato-bold text-[#4A43EC]">Send / Resend OTP</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Enter OTP */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-4">Enter OTP</Text>
                                <View className="flex-row gap-2">
                                    {otp.map((digit, i) => (
                                        <View
                                            key={i}
                                            className="bg-white border border-gray-200 rounded-xl items-center justify-center"
                                            style={{ width: (width - 82) / 6, height: (width - 82) / 6 }}
                                        >
                                            <TextInput
                                                ref={(ref) => { otpRefs.current[i] = ref; }}
                                                className="text-xl font-lato-medium text-black text-center w-full h-full"
                                                maxLength={1}
                                                keyboardType="number-pad"
                                                textAlign="center"
                                                value={digit}
                                                onChangeText={(text) => handleOtpChange(text, i)}
                                                onKeyPress={(e) => handleOtpKeyPress(e, i)}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <View className="flex-row items-center justify-between mt-4">
                                    <Text className={`text-xs font-lato-bold ${verifiedOwnerContact === cleanOwnerPhone() && cleanOwnerPhone() ? "text-green-600" : "text-gray-500"}`}>
                                        {verifiedOwnerContact === cleanOwnerPhone() && cleanOwnerPhone()
                                            ? "Owner contact verified"
                                            : "Verify owner contact to continue"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={verifyOwnerOtp}
                                        disabled={verifyingOwnerOtp}
                                        activeOpacity={0.8}
                                        className="px-4 py-2 rounded-lg bg-[#F0EFFD]"
                                    >
                                        {verifyingOwnerOtp
                                            ? <ActivityIndicator size="small" color="#4A43EC" />
                                            : <Text className="text-xs font-lato-bold text-[#4A43EC]">Verify OTP</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Owner Email Address */}
                            <View style={{ marginTop: 38 }}>
                                <Text className="text-sm font-lato-bold text-black mb-3">Owner Email Address (Optional)</Text>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                    placeholder="eg. owner@email.com"
                                    placeholderTextColor="#C0C0C0"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={ownerEmail}
                                    onChangeText={setOwnerEmail}
                                />
                            </View>

                            {/* Owner Address */}
                            <View style={{ marginTop: 20 }}>
                                <Text className="text-sm font-lato-bold text-black mb-3">Owner Address</Text>
                                <View className="flex-row bg-white border border-gray-300 rounded-xl px-4 py-2 items-center">
                                    <TextInput
                                        className="flex-1 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Select Address"
                                        placeholderTextColor="#C0C0C0"
                                        value={ownerAddress}
                                        onChangeText={setOwnerAddress}
                                    />
                                    <TouchableOpacity
                                        onPress={() => openLocationPicker("owner_address")}
                                        activeOpacity={0.85}
                                        className="w-9 h-9 rounded-xl bg-[#d2d0fa] items-center justify-center"
                                    >
                                        <Ionicons name="locate" size={18} color="#4A43EC" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Next Button */}
                            <View className="mt-16 mb-4">
                                <TouchableOpacity
                                    className="bg-[#4A43EC] py-4 rounded-xl items-center"
                                    activeOpacity={0.8}
                                    disabled={projectLoading}
                                    onPress={async () => {
                                        try {
                                            if (verifiedOwnerContact !== cleanOwnerPhone()) {
                                                const verified = await verifyOwnerOtp();
                                                if (!verified) return;
                                            }
                                            const propertyId = getActivePropertyId();
                                            await saveOwnerDetails(propertyId);
                                            setCurrentStep(prev => prev + 1);
                                        } catch (error) {
                                            Alert.alert("Update Failed", getErrorMessage(error));
                                        }
                                    }}
                                >
                                    {projectLoading
                                        ? <ActivityIndicator color="white" />
                                        : <Text className="text-white text-sm font-lato-bold">Next</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : currentStep === 3 ? (
                        <View className="gap-5 pt-2">
                            {/* Property Name */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3">Property Name (if applicable) :</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 font-lato-medium"
                                    placeholder="Enter Property name"
                                    placeholderTextColor="#C0C0C0"
                                    value={propertyName}
                                    onChangeText={setPropertyName}
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3 pt-2">Plot / Flat / Villa ,shop, office, showroom  House no.</Text>
                                <View className="flex-row gap-3">
                                    <TextInput
                                        style={{ width: (width - 52) / 2 }}
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Tower no."
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType="numeric"
                                        value={towerNumber}
                                        onChangeText={setTowerNumber}
                                    />
                                    <TextInput
                                        style={{ width: (width - 52) / 2 }}
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Flat no."
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType="numeric"
                                        value={flatNumber}
                                        onChangeText={setFlatNumber}
                                    />
                                </View>
                                <Text className="text-[10px] text-gray-800 font-lato-medium mt-1 text-right">tower no . is only  for flat</Text>
                            </View>

                            {/* Location */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3">Location</Text>
                                <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-2 items-center">
                                    <TextInput
                                        className="flex-1 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Address & Landmark"
                                        placeholderTextColor="#C0C0C0"
                                        value={locationText}
                                        onChangeText={setLocationText}
                                    />
                                    <TouchableOpacity
                                        onPress={() => openLocationPicker("property_location")}
                                        activeOpacity={0.85}
                                        className="w-9 h-9 rounded-xl bg-[#d2d0fa] items-center justify-center"
                                    >
                                        <Ionicons name="locate" size={18} color="#4A43EC" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <View className="flex-row gap-2 pt-2">
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-sm font-lato-bold text-black mb-3">City</Text>
                                        <TextInput
                                            className="bg-white border border-gray-200 rounded-xl px-3 py-4 text-sm text-gray-800 font-lato-medium"
                                            placeholder="city"
                                            placeholderTextColor="#C0C0C0"
                                            value={city}
                                            onChangeText={setCity}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-sm font-lato-bold text-black mb-3">State</Text>
                                        <TextInput
                                            className="bg-white border border-gray-200 rounded-xl px-3 py-4 text-sm text-gray-800 font-lato-medium"
                                            placeholder="state"
                                            placeholderTextColor="#C0C0C0"
                                            value={stateText}
                                            onChangeText={setStateText}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-sm font-lato-bold text-black mb-3">Pincode</Text>
                                        <TextInput
                                            className="bg-white border border-gray-200 rounded-xl px-3 py-4 text-sm text-gray-800 font-lato-medium"
                                            placeholder="pincode"
                                            placeholderTextColor="#C0C0C0"
                                            keyboardType="number-pad"
                                            value={pincode}
                                            onChangeText={setPincode}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Select Project */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3 pt-2">Select Project</Text>
                                <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-2 items-center">
                                    <TextInput
                                        className="flex-1 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Select Project Near You"
                                        placeholderTextColor="#C0C0C0"
                                        value={nearbyProject}
                                        onChangeText={setNearbyProject}
                                    />
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={openNearbyProjects}
                                        className="w-9 h-9 rounded-xl bg-[#F0EFFD] items-center justify-center ml-2"
                                    >
                                        <Ionicons name="heart-outline" size={18} color="#4A43EC" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Total Area & Carpet Area */}
                            <View className="flex-row gap-3 pt-2">
                                <View style={{ flex: 1 }}>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Total Area</Text>
                                    <View className="flex-row bg-white border border-gray-200 rounded-xl overflow-hidden items-center">
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium px-3 py-3"
                                            placeholder="eg.1000"
                                            placeholderTextColor="#C0C0C0"
                                            keyboardType="numeric"
                                            value={totalAreaValue}
                                            onChangeText={setTotalAreaValue}
                                        />
                                        <TouchableOpacity
                                            onPress={() => openUnitSheet("total")}
                                            className="bg-[#F0EFFD] h-full px-3 items-center justify-center"
                                            style={{ minHeight: 44 }}
                                        >
                                            <Text className="text-xs font-lato-bold text-[#4A43EC]">{totalAreaUnit.short}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View className="flex-row items-baseline gap-1 mb-3">
                                        <Text className="text-sm font-lato-bold text-black">Carpet Area</Text>
                                        <Text className="text-[9px] text-gray-400 font-lato-medium">(for built)</Text>
                                    </View>
                                    <View className="flex-row bg-white border border-gray-200 rounded-xl overflow-hidden items-center">
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium px-3 py-3"
                                            placeholder="eg. 200"
                                            placeholderTextColor="#C0C0C0"
                                            keyboardType="numeric"
                                            value={carpetAreaValue}
                                            onChangeText={setCarpetAreaValue}
                                        />
                                        <TouchableOpacity
                                            onPress={() => openUnitSheet("carpet")}
                                            className="bg-[#F0EFFD] h-full px-3 items-center justify-center"
                                            style={{ minHeight: 44 }}
                                        >
                                            <Text className="text-xs font-lato-bold text-[#4A43EC]">{carpetAreaUnit.short}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Khasra Number */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2 pt-3">Khasra number</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                    placeholder="Enter khasra number"
                                    placeholderTextColor="#C0C0C0"
                                    keyboardType="numeric"
                                    value={khasraNumber}
                                    onChangeText={setKhasraNumber}
                                />
                            </View>

                            {/* Property Age */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2 pt-3">Property Age</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                    placeholder="Enter Property age"
                                    placeholderTextColor="#C0C0C0"
                                    keyboardType="numeric"
                                    value={propertyAge}
                                    onChangeText={setPropertyAge}
                                />
                            </View>

                            <View className="mt-6 mb-4" style={{ opacity: hasScrolledToBottom ? 1 : 0 }} pointerEvents={hasScrolledToBottom ? "auto" : "none"}>
                                <TouchableOpacity
                                    className="bg-[#4A43EC] py-4 rounded-xl items-center"
                                    activeOpacity={0.8}
                                    disabled={projectLoading}
                                    onPress={async () => {
                                        try {
                                            const propertyId = getActivePropertyId();
                                            await saveOwnerDetails(propertyId);
                                            await savePropertyDetails(propertyId);
                                            await saveAreaDetails(propertyId);
                                            setCurrentStep(prev => prev + 1);
                                        } catch (error) {
                                            Alert.alert("Update Failed", getErrorMessage(error));
                                        }
                                    }}
                                >
                                    {projectLoading
                                        ? <ActivityIndicator color="white" />
                                        : <Text className="text-white text-sm font-lato-bold">Next</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View className="gap-5 pt-2">

                            <Text className="text-md font-lato-bold text-black">Upload Property Images & Documents</Text>

                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2 mt-5">Upload Images</Text>
                                <TouchableOpacity
                                    className="rounded-xl items-center justify-center py-10"
                                    style={{ backgroundColor: "#EEF0FB", borderWidth: 1, borderColor: "#D8DBEF", borderStyle: "dashed" }}
                                    activeOpacity={0.7}
                                    onPress={() => { setPickerModal("image"); uploadSheetRef.current?.present(); }}
                                >
                                    <View className="w-12 h-12 rounded-full bg-[#D8DBEF] items-center justify-center mb-3">
                                        <Ionicons name="image-outline" size={24} color="#4A43EC" />
                                    </View>
                                    <Text className="text-sm font-lato-bold text-[#4A43EC] mb-1">
                                        {uploadedImages.length > 0 ? `${uploadedImages.length} Photo(s) Added` : "Add atleast 5 Photos"}
                                    </Text>
                                    <Text className="text-[11px] text-gray-400 font-lato-medium">click from camera or browse to upload</Text>
                                </TouchableOpacity>
                                {uploadedImages.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                                        {uploadedImages.map((img, idx) => (
                                            <Image key={idx} source={{ uri: img.uri }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }} />
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            {/* Upload Documents */}
                            <View>
                                <View className="flex-row items-center gap-1 mb-2 mt-4">
                                    <Text className="text-sm font-lato-bold text-black">Upload Property Documents</Text>
                                    <Text className="text-xs text-gray-400 font-lato-medium">(Optional)</Text>
                                </View>
                                <TouchableOpacity
                                    className="rounded-xl items-center justify-center py-10"
                                    style={{ backgroundColor: "#EEF0FB", borderWidth: 1, borderColor: "#D8DBEF", borderStyle: "dashed" }}
                                    activeOpacity={0.7}
                                    onPress={() => { setPickerModal("document"); uploadSheetRef.current?.present(); }}
                                >
                                    <View className="w-12 h-12 rounded-full bg-[#D8DBEF] items-center justify-center mb-3">
                                        <Ionicons name="document-outline" size={24} color="#4A43EC" />
                                    </View>
                                    <Text className="text-sm font-lato-bold text-[#4A43EC] mb-1">
                                        {uploadedDocs.length > 0 ? `${uploadedDocs.length} Document(s) Added` : "Upload Documents"}
                                    </Text>
                                    <Text className="text-[11px] text-gray-400 font-lato-medium">click from camera or browse to upload</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Selling Price */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2 mt-3">Selling Price</Text>
                                <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-2 items-center">
                                    <Text className="text-lg text-gray-700 mr-2">₹</Text>
                                    <TextInput
                                        className="flex-1 text-sm text-gray-800 font-lato-medium"
                                        keyboardType="numeric"
                                        placeholderTextColor="#C0C0C0"
                                        value={sellingPrice}
                                        onChangeText={setSellingPrice}
                                    />
                                </View>
                            </View>

                            {/* Checkboxes */}
                            <View className="gap-3">
                                <TouchableOpacity
                                    className="flex-row items-center gap-2"
                                    onPress={() => setPriceNegotiable(v => !v)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="w-4 h-4 rounded border items-center justify-center"
                                        style={{ borderColor: priceNegotiable ? "#4A43EC" : "#C0C0C0", backgroundColor: priceNegotiable ? "#4A43EC" : "white" }}
                                    >
                                        {priceNegotiable && <Ionicons name="checkmark" size={10} color="white" />}
                                    </View>
                                    <Text className="text-xs text-gray-600 font-lato-medium">Price Negotiable</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="flex-row items-center gap-2"
                                    onPress={() => setTaxExclude(v => !v)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="w-4 h-4 rounded border items-center justify-center"
                                        style={{ borderColor: taxExclude ? "#4A43EC" : "#C0C0C0", backgroundColor: taxExclude ? "#4A43EC" : "white" }}
                                    >
                                        {taxExclude && <Ionicons name="checkmark" size={10} color="white" />}
                                    </View>
                                    <Text className="text-xs text-gray-600 font-lato-medium">Tax and Govt. charges exclude</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Preferred Payment Mode */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3 mt-4">Preferred Payment Mode</Text>
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => setPaymentMode("full")}
                                        className="rounded-full px-5 py-2"
                                        style={{ backgroundColor: paymentMode === "full" ? "#cfcef1ff" : "white", borderWidth: 1, borderColor: paymentMode === "full" ? "#6964f6ff" : "#D0D0D0" }}
                                    >
                                        <Text className="text-xs font-lato-bold" style={{ color: paymentMode === "full" ? "#7773f7ff" : "#666" }}>Full Payment</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setPaymentMode("emi")}
                                        className="rounded-full px-5 py-2"
                                        style={{ backgroundColor: paymentMode === "emi" ? "#cfcef1ff" : "white", borderWidth: 1, borderColor: paymentMode === "emi" ? "#6964f6ff" : "#D0D0D0" }}
                                    >
                                        <Text className="text-xs font-lato-bold" style={{ color: paymentMode === "emi" ? "#7773f7ff" : "#666" }}>EMI/ Loan Option Available</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Agreement & Submission */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-3">Agreement & Submission</Text>
                                <TouchableOpacity
                                    className="flex-row items-start gap-2"
                                    onPress={() => setAgreed(v => !v)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="w-4 h-4 rounded border items-center justify-center mt-0.5"
                                        style={{ borderColor: agreed ? "#4A43EC" : "#C0C0C0", backgroundColor: agreed ? "#4A43EC" : "white" }}
                                    >
                                        {agreed && <Ionicons name="checkmark" size={10} color="white" />}
                                    </View>
                                    <Text className="flex-1 text-xs text-gray-600 font-lato-medium leading-5">
                                        I confirm that the provided details are accurate and that I am the legal owner or have the right to list this property for sale.
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Submit Button */}
                            <View className="mt-6 mb-4">
                                <TouchableOpacity
                                    className="bg-[#4A43EC] py-4 rounded-xl items-center"
                                    activeOpacity={0.8}
                                    disabled={projectLoading}
                                    onPress={async () => {
                                        if (!agreed) {
                                            Alert.alert("Agreement Required", "Please confirm the agreement before submitting.");
                                            return;
                                        }
                                        try {
                                            const propertyId = getActivePropertyId();

                                            if (!propertyId) {
                                                Alert.alert("Update Failed", "Property ID is missing.");
                                                return;
                                            }

                                            if (isEditMode) {
                                                await saveOwnerDetails(propertyId);
                                                await savePropertyDetails(propertyId);
                                                await saveAreaDetails(propertyId);
                                            }
                                            
                                            if (sellingPrice) {
                                                await dispatch(updatePricingDetails({
                                                    projectId: propertyId,
                                                    selling_price: Number(sellingPrice),
                                                    is_negotiable: priceNegotiable,
                                                    tax_included: !taxExclude, 
                                                    payment_mode: paymentMode,
                                                })).unwrap();
                                            }
                                            
                                            const newImages = (uploadedImages || []).filter(img => 
                                                img.uri && !img.url && img.uri.startsWith('file://')
                                            );
                                            const newDocs = (uploadedDocs || []).filter(doc => 
                                                doc.uri && !doc.url && doc.uri.startsWith('file://')
                                            );
                                            
                                            const hasNewImages = newImages.length > 0;
                                            const hasNewDocs = newDocs.length > 0;
                                            
                                            if (!isEditMode || hasNewImages || hasNewDocs) {
                                                await dispatch(uploadProjectMedia({
                                                    projectId: propertyId,
                                                    images: isEditMode ? newImages : (uploadedImages || []),
                                                    documents: isEditMode ? newDocs : (uploadedDocs || []),
                                                })).unwrap();
                                            }
                                            
                                            // Trigger notification for property upload (only for new properties)
                                            if (!isEditMode) {
                                                await notifyPropertyUploaded({ 
                                                    propertyId, 
                                                    propertyName: propertyName || ownerName || 'Your property'
                                                });
                                            }
                                            
                                            Alert.alert(
                                                "Success",
                                                isEditMode ? "Property updated successfully!" : "Property submitted successfully!",
                                                [
                                                    {
                                                        text: "OK",
                                                        onPress: () => {
                                                            dispatch(resetProject());
                                                            router.push("/(tabs)/favourite");
                                                        }
                                                    }
                                                ]
                                            );
                                        } catch (err) {
                                            console.error('📤 [addProject] Submission error:', err);
                                            Alert.alert(
                                                "Submission Failed",
                                                getErrorMessage(err)
                                            );
                                        }
                                    }}
                                >
                                    {projectLoading
                                        ? <ActivityIndicator color="white" />
                                        : <Text className="text-white text-sm font-lato-bold">
                                            {isEditMode ? "Update" : "Submit"}
                                          </Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Area Unit Bottom Sheet */}
            <BottomSheetModal
                ref={unitSheetRef}
                snapPoints={["60%"]}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
                backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            >
                <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Lato-Bold", color: "#000", marginBottom: 16 }}>
                        Select Unit
                    </Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {areaUnits.map((unit) => {
                            const isSelected = activeUnitTarget === "total"
                                ? totalAreaUnit.id === unit.id
                                : carpetAreaUnit.id === unit.id;
                            return (
                                <TouchableOpacity
                                    key={unit.id}
                                    onPress={() => selectUnit(unit)}
                                    style={{
                                        paddingVertical: 14,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#F3F4F6",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        fontFamily: isSelected ? "Lato-Bold" : "Lato-Regular",
                                        color: isSelected ? "#4A43EC" : "#374151",
                                    }}>
                                        {unit.label}
                                    </Text>
                                    {isSelected && <Ionicons name="checkmark" size={18} color="#4A43EC" />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </BottomSheetView>
            </BottomSheetModal>

            <BottomSheetModal
                ref={uploadSheetRef}
                snapPoints={["32%"]}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
                backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            >
                <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Lato-Bold", color: "#000", marginBottom: 20 }}>
                        {pickerModal === "image" ? "Upload Images" : "Upload Documents"}
                    </Text>
                    {pickerModal === "image" && (
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}
                            onPress={pickFromCamera}
                            activeOpacity={0.7}
                        >
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0EFFD", alignItems: "center", justifyCenter: "center" }}>
                                <Ionicons name="camera-outline" size={20} color="#4A43EC" />
                            </View>
                            <Text style={{ fontSize: 14, fontFamily: "Lato-Bold", color: "#1F2937" }}>Take a Photo</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14 }}
                        onPress={pickFromGallery}
                        activeOpacity={0.7}
                    >
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0EFFD", alignItems: "center", justifyCenter: "center" }}>
                            <Ionicons name={pickerModal === "document" ? "document-outline" : "images-outline"} size={20} color="#4A43EC" />
                        </View>
                        <Text style={{ fontSize: 14, fontFamily: "Lato-Bold", color: "#1F2937" }}>
                            {pickerModal === "document" ? "Browse Files" : "Browse from Gallery"}
                        </Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>

        </View>
    );
}
