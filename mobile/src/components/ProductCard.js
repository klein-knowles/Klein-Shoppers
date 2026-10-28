import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii } from "../theme";
import { money, stars } from "../utils/format";

export function ProductCard({ product, onAdd, onOpen, style, compact = false }) {
  return (
    <View style={[styles.card, compact && styles.compactCard, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}`}
        onPress={() => onOpen(product)}
        style={({ pressed }) => [styles.touchArea, pressed && styles.pressed]}
      >
        <Image source={{ uri: product.image }} style={[styles.image, compact && styles.compactImage]} />
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{product.badge}</Text>
          {product.local ? <Text style={styles.localBadge}>Local</Text> : null}
        </View>
        <Text style={styles.name} numberOfLines={compact ? 2 : 3}>
          {product.name}
        </Text>
        <Text style={styles.rating}>
          {stars(product.rating)} <Text style={styles.ratingValue}>{product.rating}</Text>
        </Text>
        <Text style={styles.price}>{money(product.price)}</Text>
        <Text style={styles.shipping}>FREE delivery by Wednesday</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add ${product.name} to cart`}
        onPress={() => onAdd(product)}
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
      >
        <Text style={styles.addButtonText}>Add to cart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 318,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.panel
  },
  compactCard: {
    width: 206
  },
  touchArea: {
    flex: 1
  },
  pressed: {
    opacity: 0.82
  },
  image: {
    width: "100%",
    height: 118,
    marginBottom: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.soft
  },
  compactImage: {
    height: 112
  },
  badgeRow: {
    minHeight: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 7
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.navAlt,
    color: colors.white,
    fontSize: 11,
    fontWeight: "800"
  },
  localBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.soft,
    color: colors.link,
    fontSize: 11,
    fontWeight: "800"
  },
  name: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19
  },
  rating: {
    marginTop: 6,
    color: colors.warning,
    fontSize: 12,
    fontWeight: "700"
  },
  ratingValue: {
    color: colors.muted
  },
  price: {
    marginTop: 7,
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  shipping: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16
  },
  addButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.accent
  },
  addButtonPressed: {
    backgroundColor: colors.accentStrong
  },
  addButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  }
});
