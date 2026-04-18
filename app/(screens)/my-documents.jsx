import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

const DOCUMENT_TYPES = [
  { type: "ADHAR_FRONT", label: "Adharcard Front" },
  { type: "ADHAR_BACK", label: "Adharcard Back" },
  { type: "PAN", label: "PAN Card" },
  { type: "SELFIE", label: "Selfie" },
];

export default function MyDocuments() {
  const router = useRouter();
  const documents = useSelector((state) => state.documents.list);

  const [imageSizes, setImageSizes] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const getDoc = (type) => documents.find((d) => d.type === type);

  const allApproved =
    documents.length > 0 &&
    documents.every((d) => d.status === "approved");

  useEffect(() => {
    documents.forEach((doc) => {
      if (doc.imageUrl && !imageSizes[doc.id]) {
        Image.getSize(
          doc.imageUrl,
          (w, h) => {
            setImageSizes((prev) => ({ ...prev, [doc.id]: { width: w, height: h } }));
          },
          () => { }
        );
      }
    });
  }, [documents]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBottom: 10,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: "Lato-Bold", color: "#111" }}>
          My Documents
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontFamily: "Manrope-ExtraBold", color: "#111" }}>
            Uploaded Documents
          </Text>
          {allApproved && (
            <Text style={{ fontSize: 14, fontFamily: "Manrope-Bold", color: "#22C55E" }}>
              Approved
            </Text>
          )}
        </View>

        {DOCUMENT_TYPES.map(({ type, label }) => {
          const doc = getDoc(type);

          return (
            <View key={type} style={{ marginBottom: 24 }}>
              {/* Label */}
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Manrope-Bold",
                  color: "#111",
                  marginBottom: 10,
                }}
              >
                {label}
              </Text>

              {/* Image card */}
              <Pressable
                onPress={() => doc?.imageUrl && setPreviewImage(doc.imageUrl)}
                style={{
                  backgroundColor: "#EEF0FF",
                  borderRadius: 18,
                  padding: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 80,
                }}
              >
                {doc?.imageUrl ? (
                  <View style={{ width: "100%", borderRadius: 12, overflow: "hidden" }}>
                    <Image
                      source={{ uri: doc.imageUrl }}
                      style={{
                        width: "100%",
                        aspectRatio: imageSizes[doc.id]
                          ? imageSizes[doc.id].width / imageSizes[doc.id].height
                          : 4 / 3,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 30 }}>
                    <Ionicons name="document-outline" size={36} color="#A0A0CC" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Manrope-Medium",
                        color: "#A0A0CC",
                        marginTop: 8,
                      }}
                    >
                      Not uploaded
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Full-screen Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.92)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={() => setPreviewImage(null)}
            style={{
              position: "absolute",
              top: 52,
              right: 20,
              padding: 8,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 50,
            }}
          >
            <Ionicons name="close" size={26} color="white" />
          </Pressable>

          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 14 }}
              resizeMode="contain"
            />
          )}
          <Text
            style={{
              color: "white",
              fontFamily: "Manrope-Bold",
              fontSize: 15,
              marginTop: 16,
            }}
          >
            Document Preview
          </Text>
        </View>
      </Modal>
    </View>
  );
}
