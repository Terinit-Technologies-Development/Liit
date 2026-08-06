import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppButton } from "../../../../src/components/ui/AppButton";
import { TextField } from "../../../../src/components/forms/TextField";
import { Icon } from "../../../../src/design-system/icons/Icon";
import { theme } from "../../../../src/design-system/theme";
import { useContentPosts } from "../../../../src/hooks/creator/useCreatorQueries";
import { CreatorContentPost } from "../../../../src/domain/creator";
import { EmptyState } from "../../../../src/components/feedback/EmptyState";

export default function EventContentScreen() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const { data: rawPosts } = useContentPosts(eventId);

  const [posts, setPosts] = useState<CreatorContentPost[]>(rawPosts || []);
  const [showEditor, setShowEditor] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const togglePin = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isPinned: !p.isPinned,
              state: !p.isPinned ? "pinned" : "public",
            }
          : p,
      ),
    );
  };

  const toggleHide = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, state: p.state === "hidden" ? "public" : "hidden" }
          : p,
      ),
    );
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this content post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPosts((prev) => prev.filter((p) => p.id !== postId));
          },
        },
      ],
    );
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newBody.trim()) {
      Alert.alert("Missing Fields", "Title and Body are required.");
      return;
    }

    const created: CreatorContentPost = {
      id: `post-${Date.now()}`,
      eventId,
      eventTitle: "Midnight Kinetic Grooves",
      title: newTitle.trim(),
      body: newBody.trim(),
      type: "announcement",
      state: "public",
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      isPinned: false,
      commentsEnabled: true,
    };

    setPosts([created, ...posts]);
    setNewTitle("");
    setNewBody("");
    setShowEditor(false);
  };

  const activePosts = posts.length > 0 ? posts : rawPosts || [];

  return (
    <Screen style={styles.container} testID="creator-content-screen">
      <AppHeader
        title="Event Content & Posts"
        rightElement={
          <Pressable
            style={styles.createBtn}
            onPress={() => setShowEditor(true)}
          >
            <Icon name="add" size="xs" color={theme.colors.accentStart} />
            <AppText
              variant="caption"
              color="accentStart"
              style={{ fontWeight: "bold" }}
            >
              New Post
            </AppText>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {activePosts && activePosts.length > 0 ? (
          activePosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <AppText variant="label" color="textPrimary">
                      {post.title}
                    </AppText>
                    <View
                      style={[
                        styles.badge,
                        post.state === "pinned"
                          ? styles.badgePinned
                          : post.state === "hidden"
                            ? styles.badgeHidden
                            : styles.badgePublic,
                      ]}
                    >
                      <AppText variant="caption" style={styles.badgeText}>
                        {post.state.toUpperCase()}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={{ marginTop: 4 }}
                  >
                    {post.body}
                  </AppText>
                </View>
              </View>

              <View style={styles.postStatsRow}>
                <AppText variant="caption" color="textMuted">
                  {post.views} views • {post.likes} reactions •{" "}
                  {post.type.toUpperCase()}
                </AppText>
              </View>

              {/* Working Actions */}
              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => togglePin(post.id)}
                >
                  <Icon name="pin" size="xs" color={theme.colors.textMuted} />
                  <AppText variant="caption" color="textMuted">
                    {post.isPinned ? "Unpin" : "Pin"}
                  </AppText>
                </Pressable>

                <Pressable
                  style={styles.actionBtn}
                  onPress={() => toggleHide(post.id)}
                >
                  <Icon name="close" size="xs" color={theme.colors.textMuted} />
                  <AppText variant="caption" color="textMuted">
                    {post.state === "hidden" ? "Unhide" : "Hide"}
                  </AppText>
                </Pressable>

                <Pressable
                  style={styles.actionBtn}
                  onPress={() => handleDelete(post.id)}
                >
                  <Icon
                    name="close"
                    size="xs"
                    color={theme.colors.destructive}
                  />
                  <AppText variant="caption" color="destructive">
                    Delete
                  </AppText>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title="No Content for this Event"
            description="Create an announcement or story for attendees."
          />
        )}
      </ScrollView>

      {/* Content Editor Modal */}
      <Modal visible={showEditor} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="heading" color="textPrimary">
                Create Event Post
              </AppText>
              <Pressable onPress={() => setShowEditor(false)}>
                <Icon name="close" size="sm" color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={{ marginBottom: theme.spacing.md }}>
              <AppText variant="label" style={{ marginBottom: 4 }}>
                Post Title *
              </AppText>
              <TextField
                placeholder="e.g. Set Times & DJ Lineup"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={{ marginBottom: theme.spacing.lg }}>
              <AppText variant="label" style={{ marginBottom: 4 }}>
                Post Body / Caption *
              </AppText>
              <TextField
                placeholder="Write update for event attendees..."
                value={newBody}
                onChangeText={setNewBody}
                multiline
                style={{ minHeight: 90 }}
              />
            </View>

            <AppButton label="Publish Post" onPress={handleCreatePost} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  postCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  postHeader: { marginBottom: theme.spacing.xs },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgePinned: { backgroundColor: "rgba(149, 145, 255, 0.2)" },
  badgePublic: { backgroundColor: "rgba(0, 200, 120, 0.15)" },
  badgeHidden: { backgroundColor: "rgba(255, 255, 255, 0.08)" },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  postStatsRow: {
    paddingVertical: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.xs,
  },
  actionRow: { flexDirection: "row", gap: theme.spacing.md },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surfacePrimary,
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
});
