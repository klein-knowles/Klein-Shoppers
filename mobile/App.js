import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { ProductCard } from "./src/components/ProductCard";
import { categories, collections, hero, products } from "./src/data/products";
import { colors, radii } from "./src/theme";
import { money, stars } from "./src/utils/format";

const tabs = [
  { id: "home", label: "Home" },
  { id: "deals", label: "Deals" },
  { id: "categories", label: "Categories" },
  { id: "cart", label: "Cart" }
];

const logoImage = require("./assets/klein-shoppers-logo.png");

function filterProducts(items, category, query) {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const searchable = `${product.name} ${product.category} ${product.badge}`.toLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const visibleProducts = useMemo(
    () => filterProducts(products, activeCategory, query),
    [activeCategory, query]
  );
  const dealProducts = useMemo(
    () => filterProducts(products.filter((product) => product.deal), activeCategory, query),
    [activeCategory, query]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function chooseCategory(categoryId) {
    setActiveCategory(categoryId);
    setActiveTab(categoryId === "all" ? "home" : "categories");
  }

  function checkout() {
    Alert.alert(
      "Checkout",
      "Checkout is ready for payment and delivery integration. Cart details are already tracked in the app."
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.nav} />
      <View style={styles.appShell}>
        <Header
          cartCount={cartCount}
          onCartPress={() => setActiveTab("cart")}
          query={query}
          setQuery={setQuery}
        />

        <View style={styles.screen}>
          {activeTab === "home" ? (
            <HomeScreen
              activeCategory={activeCategory}
              addToCart={addToCart}
              chooseCategory={chooseCategory}
              onOpenProduct={setSelectedProduct}
              products={visibleProducts}
              setActiveTab={setActiveTab}
            />
          ) : null}

          {activeTab === "deals" ? (
            <ProductsScreen
              activeCategory={activeCategory}
              addToCart={addToCart}
              chooseCategory={chooseCategory}
              emptyText="No deals matched your search."
              onOpenProduct={setSelectedProduct}
              products={dealProducts}
              subtitle="Limited-time offers, local finds, and fast-delivery favorites."
              title="Trending deals"
            />
          ) : null}

          {activeTab === "categories" ? (
            <ProductsScreen
              activeCategory={activeCategory}
              addToCart={addToCart}
              chooseCategory={chooseCategory}
              emptyText="No products matched this category."
              onOpenProduct={setSelectedProduct}
              products={visibleProducts}
              subtitle="Browse by department and add items to your cart."
              title="Shop by category"
            />
          ) : null}

          {activeTab === "cart" ? (
            <CartScreen
              addToCart={addToCart}
              cart={cart}
              checkout={checkout}
              removeFromCart={removeFromCart}
              total={cartTotal}
            />
          ) : null}
        </View>

        <TabBar activeTab={activeTab} cartCount={cartCount} setActiveTab={setActiveTab} />
        <ProductDetail
          addToCart={addToCart}
          product={selectedProduct}
          setProduct={setSelectedProduct}
        />
      </View>
    </SafeAreaView>
  );
}

function Header({ cartCount, onCartPress, query, setQuery }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.brand}>
          <Image source={logoImage} style={styles.brandLogo} />
          <View style={styles.brandCopy}>
            <Text style={styles.brandMark}>Buy Uganda Build Uganda</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={onCartPress} style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Cart</Text>
          <Text style={styles.cartCount}>{cartCount}</Text>
        </Pressable>
      </View>

      <Text style={styles.delivery}>Deliver to Kampala, Uganda</Text>

      <View style={styles.searchBox}>
        <TextInput
          autoCapitalize="none"
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search Klein Shoppers Uganda"
          placeholderTextColor="#6d7b82"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
      </View>
    </View>
  );
}

function HomeScreen({
  activeCategory,
  addToCart,
  chooseCategory,
  onOpenProduct,
  products: filteredProducts,
  setActiveTab
}) {
  const deals = filteredProducts.filter((product) => product.deal).slice(0, 8);
  const recommended = filteredProducts.slice(0, 6);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ImageBackground source={{ uri: hero.image }} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroScrim}>
          <Text style={styles.heroKicker}>{hero.kicker}</Text>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroSubtitle}>{hero.subtitle}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("deals")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>See deals</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <CategoryScroller activeCategory={activeCategory} onSelect={chooseCategory} />

      <View style={styles.collectionRow}>
        {collections.map((collection) => (
          <Pressable
            accessibilityRole="button"
            key={collection.id}
            onPress={() => chooseCategory(collection.category)}
            style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}
          >
            <Image source={{ uri: collection.image }} style={styles.collectionImage} />
            <Text style={styles.collectionTitle}>{collection.title}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeading
        actionLabel="See all"
        onAction={() => setActiveTab("deals")}
        subtitle="Fast-moving offers from the catalog"
        title="Trending deals"
      />
      <HorizontalProducts addToCart={addToCart} onOpenProduct={onOpenProduct} products={deals} />

      <SectionHeading
        subtitle={`${recommended.length} result${recommended.length === 1 ? "" : "s"}`}
        title="Recommended for you"
      />
      <ProductGrid addToCart={addToCart} onOpenProduct={onOpenProduct} products={recommended} />
    </ScrollView>
  );
}

function ProductsScreen({
  activeCategory,
  addToCart,
  chooseCategory,
  emptyText,
  onOpenProduct,
  products: screenProducts,
  subtitle,
  title
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.screenIntro}>
        <Text style={styles.screenTitle}>{title}</Text>
        <Text style={styles.screenSubtitle}>{subtitle}</Text>
      </View>
      <CategoryScroller activeCategory={activeCategory} onSelect={chooseCategory} />
      {screenProducts.length ? (
        <ProductGrid addToCart={addToCart} onOpenProduct={onOpenProduct} products={screenProducts} />
      ) : (
        <Text style={styles.emptyText}>{emptyText}</Text>
      )}
    </ScrollView>
  );
}

function CartScreen({ addToCart, cart, checkout, removeFromCart, total }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.screenIntro}>
        <Text style={styles.screenTitle}>Your cart</Text>
        <Text style={styles.screenSubtitle}>
          Review quantities before checkout. Free delivery starts at UGX 130,000.
        </Text>
      </View>

      {!cart.length ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartTitle}>Your cart is empty.</Text>
          <Text style={styles.emptyCartCopy}>Add a few finds from deals and recommendations.</Text>
        </View>
      ) : null}

      {cart.map((item) => (
        <View key={item.id} style={styles.cartLine}>
          <Image source={{ uri: item.image }} style={styles.cartLineImage} />
          <View style={styles.cartLineCopy}>
            <Text style={styles.cartLineTitle}>{item.name}</Text>
            <Text style={styles.cartLinePrice}>{money(item.price)}</Text>
            <View style={styles.quantityRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => removeFromCart(item.id)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => addToCart(item)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.totalPanel}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={!cart.length}
          onPress={checkout}
          style={[styles.checkoutButton, !cart.length && styles.disabledButton]}
        >
          <Text style={styles.checkoutButtonText}>Proceed to checkout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function CategoryScroller({ activeCategory, onSelect }) {
  return (
    <ScrollView
      contentContainerStyle={styles.categoryScroller}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const active = activeCategory === category.id;
        return (
          <Pressable
            accessibilityRole="button"
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={[styles.categoryPill, active && styles.activeCategoryPill]}
          >
            <Text style={[styles.categoryPillText, active && styles.activeCategoryPillText]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SectionHeading({ actionLabel, onAction, subtitle, title }) {
  return (
    <View style={styles.sectionHeading}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HorizontalProducts({ addToCart, onOpenProduct, products: railProducts }) {
  if (!railProducts.length) {
    return <Text style={styles.emptyText}>No deals matched your search.</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.horizontalProducts}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {railProducts.map((product) => (
        <ProductCard
          compact
          key={product.id}
          onAdd={addToCart}
          onOpen={onOpenProduct}
          product={product}
        />
      ))}
    </ScrollView>
  );
}

function ProductGrid({ addToCart, onOpenProduct, products: gridProducts }) {
  if (!gridProducts.length) {
    return <Text style={styles.emptyText}>No products matched your search.</Text>;
  }

  return (
    <View style={styles.productGrid}>
      {gridProducts.map((product) => (
        <ProductCard
          key={product.id}
          onAdd={addToCart}
          onOpen={onOpenProduct}
          product={product}
          style={styles.gridCard}
        />
      ))}
    </View>
  );
}

function ProductDetail({ addToCart, product, setProduct }) {
  if (!product) {
    return null;
  }

  return (
    <Modal animationType="slide" onRequestClose={() => setProduct(null)} transparent visible>
      <View style={styles.modalBackdrop}>
        <View style={styles.productSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.productSheetHeader}>
            <Text style={styles.productSheetTitle}>Product details</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close product details"
              onPress={() => setProduct(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>x</Text>
            </Pressable>
          </View>
          <Image source={{ uri: product.image }} style={styles.productSheetImage} />
          <Text style={styles.detailBadge}>{product.badge}</Text>
          <Text style={styles.productDetailName}>{product.name}</Text>
          <Text style={styles.productDetailRating}>
            {stars(product.rating)} {product.rating}
          </Text>
          <Text style={styles.productDetailPrice}>{money(product.price)}</Text>
          <Text style={styles.productDetailCopy}>
            Eligible for Kampala delivery with secure checkout integration ready to connect.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              addToCart(product);
              setProduct(null);
            }}
            style={styles.sheetAddButton}
          >
            <Text style={styles.sheetAddButtonText}>Add to cart</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function TabBar({ activeTab, cartCount, setActiveTab }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Pressable
            accessibilityRole="button"
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label}</Text>
            {tab.id === "cart" && cartCount ? <Text style={styles.tabCount}>{cartCount}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.nav
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.page
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: colors.nav
  },
  headerTop: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  brand: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  brandLogo: {
    width: 158,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    resizeMode: "contain"
  },
  brandCopy: {
    flex: 1,
    minWidth: 0
  },
  brandName: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900"
  },
  brandMark: {
    marginTop: 2,
    color: "#ffd6c4",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  cartButton: {
    minWidth: 66,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: radii.sm
  },
  cartButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800"
  },
  cartCount: {
    position: "absolute",
    top: -7,
    right: -7,
    minWidth: 22,
    height: 22,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 22,
    textAlign: "center"
  },
  delivery: {
    marginTop: 6,
    color: "#cbe7e1",
    fontSize: 12,
    fontWeight: "700"
  },
  searchBox: {
    height: 44,
    marginTop: 10,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radii.md,
    backgroundColor: colors.panel
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 13,
    color: colors.ink,
    fontSize: 15
  },
  screen: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 96
  },
  hero: {
    minHeight: 296,
    justifyContent: "flex-end",
    marginBottom: 12
  },
  heroImage: {
    resizeMode: "cover"
  },
  heroScrim: {
    minHeight: 296,
    justifyContent: "flex-end",
    padding: 18,
    backgroundColor: "rgba(6, 59, 63, 0.68)"
  },
  heroKicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  heroTitle: {
    maxWidth: 350,
    marginTop: 7,
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 36
  },
  heroSubtitle: {
    maxWidth: 320,
    marginTop: 9,
    color: "#e6f8f3",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  primaryButton: {
    width: 128,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.accent
  },
  primaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  categoryScroller: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  categoryPill: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    backgroundColor: colors.panel
  },
  activeCategoryPill: {
    borderColor: colors.accentStrong,
    backgroundColor: "#fff0e8"
  },
  categoryPillText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  activeCategoryPillText: {
    color: colors.danger
  },
  collectionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 8
  },
  collectionCard: {
    flex: 1,
    minHeight: 138,
    overflow: "hidden",
    borderRadius: radii.sm,
    backgroundColor: colors.panel
  },
  collectionImage: {
    width: "100%",
    height: 88,
    backgroundColor: colors.soft
  },
  collectionTitle: {
    padding: 9,
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 10
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  sectionSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  sectionAction: {
    color: colors.link,
    fontSize: 13,
    fontWeight: "900"
  },
  horizontalProducts: {
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 8
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 14
  },
  gridCard: {
    width: "48%"
  },
  screenIntro: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 6
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900"
  },
  screenSubtitle: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  emptyText: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.panel,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  emptyCart: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.panel
  },
  emptyCartTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyCartCopy: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  cartLine: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 14,
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.panel
  },
  cartLineImage: {
    width: 78,
    height: 78,
    borderRadius: radii.sm,
    backgroundColor: colors.soft
  },
  cartLineCopy: {
    flex: 1,
    minWidth: 0
  },
  cartLineTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19
  },
  cartLinePrice: {
    marginTop: 5,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  quantityRow: {
    width: 116,
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    backgroundColor: colors.white
  },
  quantityButton: {
    width: 36,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  quantityButtonText: {
    color: colors.link,
    fontSize: 19,
    fontWeight: "900"
  },
  quantityText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  totalPanel: {
    marginHorizontal: 14,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.panel
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800"
  },
  totalValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  checkoutButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.accent
  },
  disabledButton: {
    opacity: 0.45
  },
  checkoutButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23, 33, 43, 0.58)"
  },
  productSheet: {
    maxHeight: "88%",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.panel
  },
  modalHandle: {
    width: 48,
    height: 5,
    alignSelf: "center",
    marginBottom: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.line
  },
  productSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  productSheetTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    backgroundColor: colors.white
  },
  closeButtonText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  productSheetImage: {
    width: "100%",
    height: 220,
    borderRadius: radii.sm,
    backgroundColor: colors.soft
  },
  detailBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.navAlt,
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  productDetailName: {
    marginTop: 10,
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27
  },
  productDetailRating: {
    marginTop: 7,
    color: colors.warning,
    fontSize: 14,
    fontWeight: "800"
  },
  productDetailPrice: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900"
  },
  productDetailCopy: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  sheetAddButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.accent
  },
  sheetAddButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(6, 59, 63, 0.16)",
    backgroundColor: "rgba(255, 253, 248, 0.98)"
  },
  tab: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  activeTab: {
    backgroundColor: colors.soft
  },
  tabText: {
    color: "#34434a",
    fontSize: 12,
    fontWeight: "900"
  },
  activeTabText: {
    color: colors.link
  },
  tabCount: {
    position: "absolute",
    top: 4,
    right: "18%",
    minWidth: 18,
    height: 18,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 18,
    textAlign: "center"
  },
  pressed: {
    opacity: 0.82
  }
});
