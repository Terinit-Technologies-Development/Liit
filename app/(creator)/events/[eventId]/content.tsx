import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppButton } from "../../../../src/components/ui/AppButton";
import { TextField } from "../../../../src/components/forms/TextField";
import { Icon } from "../../../../src/design-system/icons/Icon";
import { theme } from "../../../../src/design-system/theme";
import {
  useContentPosts,
  useCreateContentPostMutation,
  useToggleContentPinMutation,
  useToggleContentVisibilityMutation,
  useDeleteContentPostMutation,
  useUpdateContentPostMutation,
  useCreatorEvent,
} from "../../../../src/hooks/creator/useCreatorQueries";
import {
  CreatorContentPost,
  ContentState,
} from "../../../../src/domain/creator";
import { EmptyState } from "../../../../src/components/feedback/EmptyState";

export default function EventContentScreen() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const { data: posts, isLoading, isError, refetch } = useContentPosts(eventId);
  const { data: projection, isLoading: isEventLoading } =
    useCreatorEvent(eventId);

  const createMutation = useCreateContentPostMutation();
  const updateMutation = useUpdateContentPostMutation();
  const togglePinMutation = useToggleContentPinMutation();
  const toggleVisibilityMutation = useToggleContentVisibilityMutation();
  const deleteMutation = useDeleteContentPostMutation();

  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<CreatorContentPost | null>(
    null,
  );
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCommentsEnabled, setNewCommentsEnabled] = useState(true);
  const [newAutoPin, setNewAutoPin] = useState(false);
  const [newScheduledFor, setNewScheduledFor] = useState("");

  const openCreateEditor = () => {
    setEditingPost(null);
    setNewTitle("");
    setNewBody("");
    setNewCommentsEnabled(true);
    setNewAutoPin(false);
    setNewScheduledFor("");
    setShowEditor(true);
  };

  const openEditEditor = (post: CreatorContentPost) => {
    setEditingPost(post);
    setNewTitle(post.title);
    setNewBody(post.body);
    setNewCommentsEnabled(post.commentsEnabled);
    setNewAutoPin(post.isPinned);
    setNewScheduledFor(post.scheduledFor || "");
    setShowEditor(true);
  };

  const persistPost = (state: ContentState) => {
    if (!newTitle.trim() || !newBody.trim()) {
      Alert.alert("Missing Fields", "Title and Body are required.");
      return;
    }
    const eventTitle = projection?.event?.title || eventId;

    if (editingPost) {
      updateMutation.mutate(
        {
          postId: editingPost.id,
          patch: {
            title: newTitle.trim(),
            body: newBody.trim(),
            commentsEnabled: newCommentsEnabled,
            state,
            scheduledFor:
              state === "scheduled" ? newScheduledFor.trim() : undefined,
            isPinned:
              state === "scheduled"
                ? editingPost.isPinned
                : newAutoPin || state === "pinned",
          },
        },
        {
          onSuccess: () => {
            setShowEditor(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(
      {
        title: newTitle.trim(),
        body: newBody.trim(),
        eventId,
        eventTitle,
        type: "announcement",
        state,
        commentsEnabled: newCommentsEnabled,
        autoPin: newAutoPin,
        scheduledFor:
          state === "scheduled" ? newScheduledFor.trim() : undefined,
      },
      {
        onSuccess: () => {
          setShowEditor(false);
        },
      },
    );
  };

  const handleSaveDraft = () => persistPost("draft");
  const handleSchedule = () => {
    if (!newScheduledFor.trim()) {
      Alert.alert("Schedule Required", "Enter a schedule date (YYYY-MM-DD).");
      return;
    }
    persistPost("scheduled");
  };
  const handlePublish = () => persistPost("public");

  const handleDelete = (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this content post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(postId),
        },
      ],
    );
  };

  const anyMutationPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    togglePinMutation.isPending ||
    toggleVisibilityMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Screen style={styles.container} testID="creator-content-screen">
      <AppHeader
        title="Event Content & Posts"
        rightElement={
          <Pressable
            style={styles.createBtn}
            onPress={openCreateEditor}
            testID="new-content-post-button"
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
        {isLoading || isEventLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={theme.colors.accentStart} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.stateArea}>
            <AppText variant="heading" color="textPrimary">
              Content Unavailable
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4, textAlign: "center" }}
            >
              Simulated failure while loading content posts. Retry to reload.
            </AppText>
            <AppButton
              label="Retry"
              variant="primary"
              onPress={() => refetch()}
              style={{ marginTop: theme.spacing.md }}
              testID="content-retry-button"
            />
          </View>
        ) : !projection ? (
          <EmptyState
            title="Event Not Found"
            description={`No Event exists for ID "${eventId}". Content can only be managed for a real Event.`}
            icon="warning"
          />
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => openEditEditor(post)}
                >
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
                            : post.state === "scheduled"
                              ? styles.badgeScheduled
                              : post.state === "draft"
                                ? styles.badgeDraft
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
                </Pressable>
              </View>

              <View style={styles.postStatsRow}>
                <AppText variant="caption" color="textMuted">
                  {post.views} views • {post.likes} reactions •{" "}
                  {post.type.toUpperCase()}
                  {post.state === "scheduled" && post.scheduledFor
                    ? ` • Scheduled ${post.scheduledFor}`
                    : ""}
                  {post.isPinned ? " • PINNED" : ""}
                </AppText>
              </View>

              {/* Working Actions */}
              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => togglePinMutation.mutate(post.id)}
                  testID={`toggle-pin-${post.id}`}
                >
                  <Icon name="pin" size="xs" color={theme.colors.textMuted} />
                  <AppText variant="caption" color="textMuted">
                    {post.isPinned ? "Unpin" : "Pin"}
                  </AppText>
                </Pressable>

                <Pressable
                  style={styles.actionBtn}
                  onPress={() => toggleVisibilityMutation.mutate(post.id)}
                  testID={`toggle-visibility-${post.id}`}
                >
                  <Icon name="close" size="xs" color={theme.colors.textMuted} />
                  <AppText variant="caption" color="textMuted">
                    {post.state === "hidden" ? "Unhide" : "Hide"}
                  </AppText>
                </Pressable>

                <Pressable
                  style={styles.actionBtn}
                  onPress={() => handleDelete(post.id)}
                  testID={`delete-post-${post.id}`}
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

        {anyMutationPending && (
          <View style={styles.mutationPendingRow}>
            <ActivityIndicator size="small" color={theme.colors.accentStart} />
            <AppText variant="caption" color="textMuted">
              Updating content store...
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* Content Editor Modal */}
      <Modal visible={showEditor} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="heading" color="textPrimary">
                {editingPost ? "Edit Content Post" : "Create Event Post"}
              </AppText>
              <Pressable onPress={() => setShowEditor(false)}>
                <Icon name="close" size="sm" color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView>
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

              <View style={{ marginBottom: theme.spacing.md }}>
                <AppText variant="label" style={{ marginBottom: 4 }}>
                  Post Body / Caption *
                </AppText>
                <TextField
                  placeholder="Write update for event attendees..."
                  value={newBody}
                  onChangeText={setNewBody}
                  multiline
                  style={{ minHeight: 80 }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" color="textPrimary">
                    Comments Enabled
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    Allow attendees to react and reply.
                  </AppText>
                </View>
                <Switch
                  value={newCommentsEnabled}
                  onValueChange={setNewCommentsEnabled}
                  testID="content-comments-toggle"
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" color="textPrimary">
                    Auto-Pin on Publish
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    Pin this post to the top of the Event feed.
                  </AppText>
                </View>
                <Switch
                  value={newAutoPin}
                  onValueChange={setNewAutoPin}
                  testID="content-autopin-toggle"
                />
              </View>

              <View style={{ marginBottom: theme.spacing.md }}>
                <AppText variant="label" style={{ marginBottom: 4 }}>
                  Schedule Date (YYYY-MM-DD)
                </AppText>
                <TextField
                  placeholder="2026-08-20"
                  value={newScheduledFor}
                  onChangeText={setNewScheduledFor}
                />
              </View>

              <View style={styles.editorActions}>
                <AppButton
                  label="Save Draft"
                  variant="secondary"
                  onPress={handleSaveDraft}
                  style={{ flex: 1 }}
                  testID="content-save-draft"
                />
                <AppButton
                  label="Schedule"
                  variant="secondary"
                  onPress={handleSchedule}
                  style={{ flex: 1 }}
                  testID="content-schedule"
                />
              </View>
              <AppButton
                label="Publish (Simulated)"
                variant="primary"
                onPress={handlePublish}
                style={{ marginTop: theme.spacing.sm }}
                testID="content-publish"
              />
            </ScrollView>
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
  loadingArea: { padding: theme.spacing.xxl, alignItems: "center" },
  stateArea: { padding: theme.spacing.xxl, alignItems: "center" },
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
  badgeScheduled: { backgroundColor: "rgba(255, 170, 0, 0.2)" },
  badgeDraft: { backgroundColor: "rgba(255, 255, 255, 0.15)" },
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
  mutationPendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
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
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  editorActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
