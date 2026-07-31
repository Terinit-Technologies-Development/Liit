import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { CommentRow } from "../../src/components/social/CommentRow";
import { MessageComposer } from "../../src/components/social/MessageComposer";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { Comment } from "../../src/domain/social";
import {
  useCommentsQuery,
  usePostCommentMutation,
  useToggleReactionMutation,
} from "../../src/hooks/social/useSocialQueries";
import { routeBuilders } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function EventCommentsModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = normaliseId(params.eventId);

  const [commentText, setCommentText] = useState("");

  const commentsQuery = useCommentsQuery(eventId);
  const postCommentMutation = usePostCommentMutation();
  const toggleReactionMutation = useToggleReactionMutation();

  const comments = commentsQuery.data ?? [];

  if (!eventId) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="event-comments-error"
      >
        <ErrorState
          title="Event not found"
          description="Invalid event specified for comments."
          onAction={() => router.back()}
          actionLabel="Close"
        />
      </Screen>
    );
  }

  if (commentsQuery.isError) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="event-comments-query-error"
      >
        <ErrorState
          title="Could not load discussion"
          description="The comments could not be loaded."
          actionLabel="Retry"
          onAction={() => commentsQuery.refetch()}
        />
      </Screen>
    );
  }

  const handlePost = (text: string) => {
    const clientMutationId = `${Date.now()}`;
    postCommentMutation.mutate(
      { eventId, content: text, clientMutationId },
      {
        onSuccess: () => {
          setCommentText("");
        },
      },
    );
  };

  const handleRetry = (comment: Comment) => {
    const clientMutationId = comment.id.startsWith("optimistic-")
      ? comment.id.replace("optimistic-", "")
      : comment.id;
    postCommentMutation.mutate({
      eventId,
      content: comment.content,
      clientMutationId,
    });
  };

  const handleToggleReaction = (commentId: string) => {
    toggleReactionMutation.mutate({ commentId, eventId });
  };

  const handleReport = (commentId: string) => {
    router.push(
      routeBuilders.reportContentModal({
        targetKind: "comment",
        targetId: commentId,
      }),
    );
  };

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      testID="event-comments-modal"
    >
      <AppHeader
        title="Event Discussion"
        showBack={false}
        rightAction={{
          icon: "close",
          accessibilityLabel: "Close modal",
          onPress: () => router.back(),
          testID: "event-comments-close",
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardFlex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentRow
              comment={item}
              onToggleReaction={() => handleToggleReaction(item.id)}
              onRetry={() => handleRetry(item)}
              onReport={() => handleReport(item.id)}
              testID={`comment-row-${item.id}`}
            />
          )}
          ListEmptyComponent={
            commentsQuery.isLoading ? null : (
              <EmptyState
                title="No comments yet"
                description="Be the first to share your excitement about this event!"
              />
            )
          }
          contentContainerStyle={styles.listContent}
        />

        <MessageComposer
          value={commentText}
          onChangeText={setCommentText}
          onSend={handlePost}
          placeholder="Add a comment…"
          disabled={postCommentMutation.isPending}
          testID="event-comment-composer"
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardFlex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
