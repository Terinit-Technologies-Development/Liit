import React from "react";
import { Tabs } from "expo-router";
import { Icon, SemanticIconName } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import { CONSUMER_TAB_ROUTES } from "../../src/navigation/routes";

export { CONSUMER_TAB_ROUTES };

export default function ConsumerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surfacePrimary,
          borderTopColor: theme.colors.borderSubtle,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
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
            tabBarIcon: route.visible
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
