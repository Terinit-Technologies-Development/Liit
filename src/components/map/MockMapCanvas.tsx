import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  JOHANNESBURG_BOUNDS,
  MapPinVisualState,
  MapRenderNode,
  MapViewport,
} from "../../domain/map";
import { Event } from "../../domain/events";
import { mockMapAdapter } from "../../adapters/map/MockMapAdapter";
import { MapPin } from "./MapPin";
import { MapCluster } from "./MapCluster";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface MockMapCanvasProps {
  nodes: MapRenderNode[];
  eventsById: Record<string, Event>;
  selectedEventId: string | null;
  viewport: MapViewport;

  onSelectEvent(eventId: string): void;
  onOpenCluster(eventIds: string[]): void;
}

function deriveMapPinVisualState(
  event: Event,
  selectedEventId: string | null,
): MapPinVisualState {
  if (event.id === selectedEventId) {
    return "selected";
  }
  if (event.status === "live") {
    return "live";
  }
  if (event.status === "sold_out") {
    return "sold_out";
  }
  return "default";
}

export function MockMapCanvas({
  nodes,
  eventsById,
  selectedEventId,
  viewport: _viewport,
  onSelectEvent,
  onOpenCluster,
}: MockMapCanvasProps) {
  const [size, setSize] = useState({
    width: 360,
    height: 540,
  });

  return (
    <View
      testID="mock-map-canvas"
      accessibilityLabel="Prototype Johannesburg event map"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }}
      style={styles.canvas}
    >
      {/* Visual map background pattern */}
      <View style={styles.gridOverlay} />
      <View style={styles.waterFeature} />
      <View style={styles.mainRoad} />
      <View style={styles.secondaryRoad} />

      <View style={[styles.suburbLabel, { top: "25%", left: "15%" }]}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          ROSEBANK
        </AppText>
      </View>

      <View style={[styles.suburbLabel, { top: "45%", left: "40%" }]}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          BRAAMFONTEIN
        </AppText>
      </View>

      <View style={[styles.suburbLabel, { top: "55%", left: "65%" }]}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          MABONENG
        </AppText>
      </View>

      <View style={[styles.suburbLabel, { top: "75%", left: "20%" }]}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          SOWETO
        </AppText>
      </View>

      {nodes.map((node) => {
        const point = mockMapAdapter.project(
          node.coordinate,
          JOHANNESBURG_BOUNDS,
          size,
        );

        if (node.kind === "cluster") {
          return (
            <View
              key={node.id}
              style={[
                styles.positionedNode,
                {
                  left: point.x,
                  top: point.y,
                },
              ]}
            >
              <MapCluster
                count={node.count}
                onPress={() => onOpenCluster(node.eventIds)}
              />
            </View>
          );
        }

        const event = eventsById[node.eventId];
        if (!event) {
          return null;
        }

        const pinState = deriveMapPinVisualState(event, selectedEventId);

        return (
          <View
            key={node.id}
            style={[
              styles.positionedNode,
              {
                left: point.x,
                top: point.y,
              },
            ]}
          >
            <MapPin
              testID={`map-pin-${event.id}`}
              state={pinState}
              title={event.title}
              onPress={() => onSelectEvent(event.id)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: "#15121E",
    position: "relative",
    overflow: "hidden",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  waterFeature: {
    position: "absolute",
    top: "30%",
    left: "-10%",
    width: "120%",
    height: 12,
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    transform: [{ rotate: "-15deg" }],
  },
  mainRoad: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  secondaryRoad: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  suburbLabel: {
    position: "absolute",
    opacity: 0.6,
  },
  positionedNode: {
    position: "absolute",
    transform: [{ translateX: -20 }, { translateY: -15 }],
  },
});
