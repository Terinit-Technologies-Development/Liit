import React from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Icon, SemanticIconName } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import { CONSUMER_TAB_ROUTES } from "../../src/navigation/routes";

export { CONSUMER_TAB_ROUTES };

export default function ConsumerLayout() {
  const visibleTabBarStyle = {
    backgroundColor: theme.colors.surfacePrimary,
    borderTopColor: theme.colors.borderSubtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentStart,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          ...theme.typography.label,
        },
      }}
    >
      {CONSUMER_TAB_ROUTES.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            href: route.visible ? undefined : null,
            tabBarButtonTestID: route.visible ? `tab-${route.name}` : undefined,
            tabBarStyle:
              "hideTabBar" in route && route.hideTabBar
                ? { display: "none" }
                : visibleTabBarStyle,
            tabBarIcon:
              route.visible && "icon" in route
                ? ({ color }) => (
                    <Icon
                      name={route.icon as SemanticIconName}
                      size="sm"
                      color={color as string}
                    />
                  )
                : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}
