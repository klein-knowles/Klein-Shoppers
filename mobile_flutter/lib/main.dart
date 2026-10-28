import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';

const String _assistantApiBaseUrl = String.fromEnvironment(
  'KLEIN_API_BASE_URL',
  defaultValue: 'http://10.0.2.2:5000',
);

void main() {
  runApp(const KleinShoppersApp());
}

class KleinShoppersApp extends StatelessWidget {
  const KleinShoppersApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Klein Shoppers Global',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.nav,
          primary: AppColors.nav,
          secondary: AppColors.accent,
        ),
        fontFamily: 'Roboto',
        scaffoldBackgroundColor: AppColors.page,
        useMaterial3: true,
      ),
      home: const StoreShell(),
    );
  }
}

class StoreShell extends StatefulWidget {
  const StoreShell({super.key});

  @override
  State<StoreShell> createState() => _StoreShellState();
}

class _StoreShellState extends State<StoreShell> {
  final TextEditingController _searchController = TextEditingController();
  final Map<int, CartEntry> _cart = <int, CartEntry>{};
  final Set<int> _savedProductIds = <int>{};
  int _tabIndex = 0;
  String _activeCategory = 'all';
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Product> get _visibleProducts {
    return products.where((product) {
      return product.matchesCategory(_activeCategory) &&
          product.matchesQuery(_query);
    }).toList();
  }

  List<Product> get _visibleDeals {
    return _visibleProducts.where((product) => product.isDeal).toList();
  }

  List<Product> get _savedProducts {
    return products
        .where((product) => _savedProductIds.contains(product.id))
        .toList();
  }

  int get _cartCount {
    return _cart.values.fold(0, (total, entry) => total + entry.quantity);
  }

  int get _cartTotal {
    return _cart.values.fold(
      0,
      (total, entry) => total + (entry.product.price * entry.quantity),
    );
  }

  void _setTab(int index) {
    setState(() {
      _tabIndex = index;
    });
  }

  void _setQuery(String value) {
    setState(() {
      _query = value;
    });
  }

  void _selectCategory(String categoryId) {
    setState(() {
      _activeCategory = categoryId;
      _tabIndex = 2;
    });
  }

  void _addToCart(Product product) {
    setState(() {
      final existing = _cart[product.id];
      _cart[product.id] = CartEntry(
        product: product,
        quantity: existing == null ? 1 : existing.quantity + 1,
      );
    });
  }

  void _toggleSaved(Product product) {
    setState(() {
      if (_savedProductIds.contains(product.id)) {
        _savedProductIds.remove(product.id);
      } else {
        _savedProductIds.add(product.id);
      }
    });
  }

  void _removeFromCart(Product product) {
    setState(() {
      final existing = _cart[product.id];
      if (existing == null) {
        return;
      }

      if (existing.quantity <= 1) {
        _cart.remove(product.id);
        return;
      }

      _cart[product.id] = CartEntry(
        product: product,
        quantity: existing.quantity - 1,
      );
    });
  }

  void _openProduct(Product product) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return ProductDetailSheet(
          product: product,
          isSaved: _savedProductIds.contains(product.id),
          onAdd: () {
            _addToCart(product);
            Navigator.of(context).pop();
          },
          onToggleSaved: () => _toggleSaved(product),
        );
      },
    );
  }

  void _checkout() {
    setState(() {
      _tabIndex = 5;
    });
  }

  @override
  Widget build(BuildContext context) {
    final Widget screen = switch (_tabIndex) {
      0 => HomeScreen(
        query: _query,
        activeCategory: _activeCategory,
        products: _visibleProducts,
        deals: _visibleDeals,
        savedProducts: _savedProducts,
        savedProductIds: _savedProductIds,
        onAdd: _addToCart,
        onOpen: _openProduct,
        onToggleSaved: _toggleSaved,
        onSelectCategory: _selectCategory,
        onSeeDeals: () => _setTab(1),
        onOpenAccount: () => _setTab(3),
        onShowMessage: _openServiceScreen,
      ),
      1 => ProductListScreen(
        title: 'Trending deals',
        subtitle:
            'Limited-time offers, local finds, and fast-delivery favorites.',
        emptyText: 'No deals matched your search.',
        products: _visibleDeals,
        activeCategory: _activeCategory,
        savedProductIds: _savedProductIds,
        onAdd: _addToCart,
        onOpen: _openProduct,
        onToggleSaved: _toggleSaved,
        onSelectCategory: _selectCategory,
      ),
      2 => DepartmentsScreen(
        activeCategory: _activeCategory,
        products: _visibleProducts,
        savedProductIds: _savedProductIds,
        onAdd: _addToCart,
        onOpen: _openProduct,
        onToggleSaved: _toggleSaved,
        onSelectCategory: _selectCategory,
      ),
      3 => AccountScreen(
        savedCount: _savedProductIds.length,
        onOpenOrders: () => _setTab(6),
        onOpenSupport: () => _setTab(7),
        onOpenSeller: () => _setTab(8),
        onOpenSaved: () => _setTab(9),
        onOpenPayments: () => _setTab(10),
        onOpenAddresses: () => _setTab(11),
      ),
      4 => CartScreen(
        entries: _cart.values.toList(),
        total: _cartTotal,
        savedCount: _savedProductIds.length,
        onAdd: _addToCart,
        onRemove: _removeFromCart,
        onCheckout: _checkout,
      ),
      5 => CheckoutScreen(
        entries: _cart.values.toList(),
        total: _cartTotal,
        onBackToCart: () => _setTab(4),
        onPlaceOrder: () => _setTab(6),
      ),
      6 => OrdersScreen(onBack: () => _setTab(3)),
      7 => SupportScreen(onBack: () => _setTab(3)),
      8 => SellerToolsScreen(onBack: () => _setTab(3)),
      9 => SavedItemsScreen(
        products: _savedProducts,
        savedProductIds: _savedProductIds,
        onAdd: _addToCart,
        onOpen: _openProduct,
        onToggleSaved: _toggleSaved,
        onBack: () => _setTab(3),
      ),
      10 => PaymentMethodsScreen(onBack: () => _setTab(3)),
      11 => AddressBookScreen(onBack: () => _setTab(3)),
      12 => GiftCardsScreen(onBack: () => _setTab(3)),
      _ => const SizedBox.shrink(),
    };

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: <Widget>[
            StoreHeader(
              controller: _searchController,
              cartCount: _cartCount,
              onCartTap: () => _setTab(4),
              onSearchChanged: _setQuery,
            ),
            Expanded(child: screen),
          ],
        ),
      ),
      bottomNavigationBar: StoreBottomNavigation(
        currentIndex: _tabIndex > 4 ? 3 : _tabIndex,
        cartCount: _cartCount,
        onTap: _setTab,
      ),
      floatingActionButton:
          _tabIndex == 0
              ? FloatingActionButton.extended(
                onPressed: _openAssistant,
                backgroundColor: AppColors.nav,
                foregroundColor: Colors.white,
                icon: const Icon(Icons.auto_awesome),
                label: const Text('Ask Klein Assistant'),
              )
              : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }

  void _openAssistant() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const KleinAssistantSheet(),
    );
  }

  void _openServiceScreen(String label) {
    final normalized = label.toLowerCase();
    if (normalized.contains('customer')) {
      _setTab(7);
    } else if (normalized.contains('saved')) {
      _setTab(9);
    } else if (normalized.contains('payment')) {
      _setTab(10);
    } else if (normalized.contains('sell')) {
      _setTab(8);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$label is available from Account.')),
      );
    }
  }
}

class KleinAssistantSheet extends StatefulWidget {
  const KleinAssistantSheet({super.key});

  @override
  State<KleinAssistantSheet> createState() => _KleinAssistantSheetState();
}

class _KleinAssistantSheetState extends State<KleinAssistantSheet> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<_AssistantMessage> _messages = <_AssistantMessage>[
    const _AssistantMessage(
      text:
          'Hi! I can help you find products, compare options, or answer shopping questions. What are you looking for?',
      isUser: false,
    ),
  ];
  bool _sending = false;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty || _sending) return;

    setState(() {
      _sending = true;
      _messages.add(_AssistantMessage(text: message, isUser: true));
      _messageController.clear();
      _messages.add(
        const _AssistantMessage(
          text: 'Thinking…',
          isUser: false,
          pending: true,
        ),
      );
    });
    _scrollToLatest();

    try {
      final uri = Uri.parse('$_assistantApiBaseUrl/chat');
      final client =
          HttpClient()..connectionTimeout = const Duration(seconds: 15);
      try {
        final request = await client.postUrl(uri);
        request.headers.contentType = ContentType.json;
        request.write(jsonEncode(<String, String>{'message': message}));
        final response = await request.close().timeout(
          const Duration(seconds: 30),
        );
        final body = await response.transform(utf8.decoder).join();
        final data = jsonDecode(body) as Map<String, dynamic>;
        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw Exception(
            data['error'] ??
                'Klein Assistant could not answer right now. Please try again.',
          );
        }
        _replacePendingMessage(
          (data['reply'] as String?) ?? 'I don’t have an answer for that yet.',
        );
      } finally {
        client.close(force: true);
      }
    } catch (error) {
      final details = error.toString().replaceFirst('Exception: ', '');
      _replacePendingMessage(
        details.contains('SocketException') ||
                details.contains('Connection refused')
            ? 'I can’t reach Klein Shoppers right now. Check your connection and try again.'
            : details,
        isError: true,
      );
    }
  }

  void _replacePendingMessage(String text, {bool isError = false}) {
    if (!mounted) return;
    setState(() {
      final index = _messages.lastIndexWhere((message) => message.pending);
      if (index >= 0) {
        _messages[index] = _AssistantMessage(
          text: text,
          isUser: false,
          isError: isError,
        );
      }
      _sending = false;
    });
    _scrollToLatest();
  }

  void _scrollToLatest() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        height: MediaQuery.sizeOf(context).height * 0.72,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: <Widget>[
            Container(
              padding: const EdgeInsets.fromLTRB(20, 18, 12, 16),
              decoration: BoxDecoration(
                color: AppColors.nav,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
              ),
              child: Row(
                children: <Widget>[
                  const Icon(Icons.auto_awesome, color: Colors.white),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'Klein Assistant',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                          ),
                        ),
                        Text(
                          'Your shopping assistant',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, color: Colors.white),
                    tooltip: 'Close assistant',
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final message = _messages[index];
                  return Align(
                    alignment:
                        message.isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                    child: Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.sizeOf(context).width * 0.78,
                      ),
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 11,
                      ),
                      decoration: BoxDecoration(
                        color:
                            message.isError
                                ? const Color(0xFFFFEFEC)
                                : message.isUser
                                ? const Color(0xFFDDF1E5)
                                : const Color(0xFFF1F6F4),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        message.text,
                        style: TextStyle(
                          color:
                              message.isError
                                  ? Colors.red.shade900
                                  : AppColors.ink,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      maxLength: 1000,
                      minLines: 1,
                      maxLines: 3,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: const InputDecoration(
                        hintText: 'Ask about products or shopping…',
                        counterText: '',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sending ? null : _sendMessage,
                    icon: const Icon(Icons.send),
                    tooltip: 'Send message',
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.accent,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Text(
                'AI responses can be inaccurate. Confirm product details before ordering.',
                style: TextStyle(color: Colors.black54, fontSize: 11),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AssistantMessage {
  const _AssistantMessage({
    required this.text,
    required this.isUser,
    this.pending = false,
    this.isError = false,
  });

  final String text;
  final bool isUser;
  final bool pending;
  final bool isError;
}

class StoreHeader extends StatelessWidget {
  const StoreHeader({
    required this.controller,
    required this.cartCount,
    required this.onCartTap,
    required this.onSearchChanged,
    super.key,
  });

  final TextEditingController controller;
  final int cartCount;
  final VoidCallback onCartTap;
  final ValueChanged<String> onSearchChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.nav,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: Image.asset(
                  'assets/klein-shoppers-logo.png',
                  width: 142,
                  height: 46,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Buy Uganda Build Uganda',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: AppColors.logoTag,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Klein Shoppers Global',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: AppColors.headerMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton.filledTonal(
                onPressed: onCartTap,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: 0.12),
                  foregroundColor: Colors.white,
                ),
                icon: Badge(
                  isLabelVisible: cartCount > 0,
                  label: Text('$cartCount'),
                  child: const Icon(Icons.shopping_cart_outlined),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Row(
            children: <Widget>[
              Icon(
                Icons.location_on_outlined,
                color: AppColors.accent,
                size: 17,
              ),
              SizedBox(width: 5),
              Expanded(
                child: Text(
                  'Deliver to Kampala, Uganda',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: AppColors.headerMuted,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          TextField(
            controller: controller,
            onChanged: onSearchChanged,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              hintText: 'Search Klein Shoppers Global',
              prefixIcon: const Icon(Icons.search),
              suffixIcon:
                  controller.text.isEmpty
                      ? null
                      : IconButton(
                        onPressed: () {
                          controller.clear();
                          onSearchChanged('');
                        },
                        icon: const Icon(Icons.close),
                      ),
              filled: true,
              fillColor: AppColors.panel,
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.accent, width: 2),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.accent, width: 2),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    required this.query,
    required this.activeCategory,
    required this.products,
    required this.deals,
    required this.savedProducts,
    required this.savedProductIds,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.onSelectCategory,
    required this.onSeeDeals,
    required this.onOpenAccount,
    required this.onShowMessage,
    super.key,
  });

  final String query;
  final String activeCategory;
  final List<Product> products;
  final List<Product> deals;
  final List<Product> savedProducts;
  final Set<int> savedProductIds;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final ValueChanged<String> onSelectCategory;
  final VoidCallback onSeeDeals;
  final VoidCallback onOpenAccount;
  final ValueChanged<String> onShowMessage;

  @override
  Widget build(BuildContext context) {
    if (query.trim().isNotEmpty) {
      return ProductListScreen(
        title: 'Search results',
        subtitle:
            '${products.length} result${products.length == 1 ? '' : 's'} for "$query"',
        emptyText:
            'No products matched your search. Try a broader category or shorter keyword.',
        products: products,
        activeCategory: activeCategory,
        savedProductIds: savedProductIds,
        onAdd: onAdd,
        onOpen: onOpen,
        onToggleSaved: onToggleSaved,
        onSelectCategory: onSelectCategory,
      );
    }

    return ListView(
      padding: EdgeInsets.zero,
      children: <Widget>[
        HeroPanel(
          onSeeDeals: onSeeDeals,
          onBrowseDepartments: () => onSelectCategory('all'),
        ),
        PromiseStrip(
          onOrders: onOpenAccount,
          onSupport: () => onShowMessage('Customer service'),
          onBubu: () => onSelectCategory('bubu'),
          onSell: () => onShowMessage('Sell with Klein'),
        ),
        QuickActionPanel(
          onReorder: onOpenAccount,
          onSaved: () => onShowMessage('Saved items'),
          onDelivery: () => onShowMessage('Delivery slots'),
          onPayment: () => onShowMessage('Payment methods'),
        ),
        CategoryRail(
          activeCategory: activeCategory,
          onSelectCategory: onSelectCategory,
        ),
        CollectionGrid(onSelectCategory: onSelectCategory),
        DepartmentBand(onSelectCategory: onSelectCategory),
        ProductRail(
          title: 'Trending deals',
          actionLabel: 'See all',
          products: productsFor('deals', limit: 10),
          onAction: onSeeDeals,
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        PromoBanner(
          kicker: 'Fresh market',
          title:
              'Top up your kitchen with produce, pantry goods, coffee, and home care.',
          actionLabel: 'Shop grocery',
          onTap: () => onSelectCategory('grocery'),
        ),
        ProductRail(
          title: 'Fresh, pantry and daily essentials',
          actionLabel: 'Shop grocery',
          products: productsFor('grocery'),
          onAction: () => onSelectCategory('grocery'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        ProductRail(
          title: 'Electronics and accessories',
          actionLabel: 'Shop electronics',
          products: productsFor('electronics'),
          onAction: () => onSelectCategory('electronics'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        ProductRail(
          title: 'Home, kitchen and appliances',
          actionLabel: 'Shop home',
          products: productsFor('home'),
          onAction: () => onSelectCategory('home'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        ProductRail(
          title: 'Fashion, shoes and travel',
          actionLabel: 'Shop fashion',
          products: productsFor('fashion'),
          onAction: () => onSelectCategory('fashion'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        ProductRail(
          title: 'Beauty, personal care and wellness',
          actionLabel: 'Shop beauty',
          products: productsFor('beauty'),
          onAction: () => onSelectCategory('beauty'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        if (savedProducts.isNotEmpty)
          ProductRail(
            title: 'Saved for later',
            actionLabel: 'Account',
            products: savedProducts,
            onAction: onOpenAccount,
            onAdd: onAdd,
            onOpen: onOpen,
            onToggleSaved: onToggleSaved,
            savedProductIds: savedProductIds,
          ),
        ProductRail(
          title: 'Baby, toys and family care',
          actionLabel: 'Shop family',
          products: productsFor('baby'),
          onAction: () => onSelectCategory('baby'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
        LocalMakerSection(
          products: productsFor('bubu'),
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
          onSellerTap: () => onShowMessage('Seller tools'),
        ),
        const SizedBox(height: 18),
      ],
    );
  }
}

class ProductListScreen extends StatelessWidget {
  const ProductListScreen({
    required this.title,
    required this.subtitle,
    required this.emptyText,
    required this.products,
    required this.activeCategory,
    required this.savedProductIds,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.onSelectCategory,
    super.key,
  });

  final String title;
  final String subtitle;
  final String emptyText;
  final List<Product> products;
  final String activeCategory;
  final Set<int> savedProductIds;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final ValueChanged<String> onSelectCategory;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.only(bottom: 18),
      children: <Widget>[
        ScreenIntro(title: title, subtitle: subtitle),
        CategoryRail(
          activeCategory: activeCategory,
          onSelectCategory: onSelectCategory,
        ),
        ProductGrid(
          products: products,
          emptyText: emptyText,
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
      ],
    );
  }
}

class DepartmentsScreen extends StatelessWidget {
  const DepartmentsScreen({
    required this.activeCategory,
    required this.products,
    required this.savedProductIds,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.onSelectCategory,
    super.key,
  });

  final String activeCategory;
  final List<Product> products;
  final Set<int> savedProductIds;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final ValueChanged<String> onSelectCategory;

  @override
  Widget build(BuildContext context) {
    final categoryLabel = categoryLabelFor(activeCategory);

    return ListView(
      padding: const EdgeInsets.only(bottom: 18),
      children: <Widget>[
        const ScreenIntro(
          title: 'Shop by department',
          subtitle:
              'Browse the same departments from the website and add items to your cart.',
        ),
        CategoryRail(
          activeCategory: activeCategory,
          onSelectCategory: onSelectCategory,
        ),
        DepartmentBand(onSelectCategory: onSelectCategory),
        SectionHeading(
          title: categoryLabel == 'All' ? 'All products' : categoryLabel,
          subtitle:
              '${products.length} result${products.length == 1 ? '' : 's'}',
        ),
        ProductGrid(
          products: products,
          emptyText: 'No products matched this department.',
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
      ],
    );
  }
}

class AccountScreen extends StatelessWidget {
  const AccountScreen({
    required this.savedCount,
    required this.onOpenOrders,
    required this.onOpenSupport,
    required this.onOpenSeller,
    required this.onOpenSaved,
    required this.onOpenPayments,
    required this.onOpenAddresses,
    super.key,
  });

  final int savedCount;
  final VoidCallback onOpenOrders;
  final VoidCallback onOpenSupport;
  final VoidCallback onOpenSeller;
  final VoidCallback onOpenSaved;
  final VoidCallback onOpenPayments;
  final VoidCallback onOpenAddresses;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.only(bottom: 18),
      children: <Widget>[
        const ScreenIntro(
          title: 'Account and services',
          subtitle:
              'Account links, orders, seller tools, and support from the website are organized here for the app.',
        ),
        LinkPanel(
          icon: Icons.person_outline,
          title: 'Account & Lists',
          body: 'Sign in, save addresses, and manage saved shopping lists.',
          onTap: () {},
        ),
        LinkPanel(
          icon: Icons.favorite_border,
          title: 'Saved items',
          body:
              '$savedCount item${savedCount == 1 ? '' : 's'} saved for later.',
          onTap: onOpenSaved,
        ),
        LinkPanel(
          icon: Icons.location_on_outlined,
          title: 'Delivery addresses',
          body:
              'Manage Kampala delivery addresses, contact names, and phone numbers.',
          onTap: onOpenAddresses,
        ),
        LinkPanel(
          icon: Icons.payments_outlined,
          title: 'Payment methods',
          body: 'Prepare mobile money, card, or cash-on-delivery options.',
          onTap: onOpenPayments,
        ),
        LinkPanel(
          icon: Icons.receipt_long_outlined,
          title: 'Returns & Orders',
          body:
              'Track orders and delivery windows for Kampala and nearby areas.',
          onTap: onOpenOrders,
        ),
        LinkPanel(
          icon: Icons.support_agent,
          title: 'Customer Service',
          body:
              'Get help with delivery, payment, returns, and product questions.',
          onTap: onOpenSupport,
        ),
        LinkPanel(
          icon: Icons.storefront_outlined,
          title: 'Sell with Klein',
          body:
              'Reach shoppers across Uganda with local products and daily essentials.',
          onTap: onOpenSeller,
        ),
      ],
    );
  }
}

class CartScreen extends StatelessWidget {
  const CartScreen({
    required this.entries,
    required this.total,
    required this.savedCount,
    required this.onAdd,
    required this.onRemove,
    required this.onCheckout,
    super.key,
  });

  final List<CartEntry> entries;
  final int total;
  final int savedCount;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onRemove;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.only(bottom: 18),
      children: <Widget>[
        const ScreenIntro(
          title: 'Your cart',
          subtitle:
              'Review quantities before checkout. Free delivery starts at UGX 130,000.',
        ),
        if (entries.isEmpty)
          const EmptyPanel(
            title: 'Your cart is empty.',
            body: 'Add a few finds from deals and recommendations.',
          )
        else
          ...entries.map((entry) {
            return CartLine(
              entry: entry,
              onAdd: () => onAdd(entry.product),
              onRemove: () => onRemove(entry.product),
            );
          }),
        DeliveryChoicePanel(hasItems: entries.isNotEmpty),
        TotalPanel(
          total: total,
          hasItems: entries.isNotEmpty,
          savedCount: savedCount,
          onCheckout: onCheckout,
        ),
      ],
    );
  }
}

class HeroPanel extends StatelessWidget {
  const HeroPanel({
    required this.onSeeDeals,
    required this.onBrowseDepartments,
    super.key,
  });

  final VoidCallback onSeeDeals;
  final VoidCallback onBrowseDepartments;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 390,
      child: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          const NetworkImageView(url: heroImage, fit: BoxFit.cover),
          Container(color: AppColors.nav.withValues(alpha: 0.66)),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'KLEIN MEGA MARKET',
                  style: TextStyle(
                    color: AppColors.accent,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Shop daily essentials, tech, fashion, and Ugandan-made finds in one place.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 11),
                const Text(
                  'Fast Kampala delivery, easy returns, and local BUBU picks from Klein Shoppers Global.',
                  style: TextStyle(
                    color: AppColors.heroMuted,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: <Widget>[
                    FilledButton.icon(
                      onPressed: onSeeDeals,
                      icon: const Icon(Icons.local_offer_outlined),
                      label: const Text('See deals'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.accent,
                        foregroundColor: AppColors.ink,
                        minimumSize: const Size(132, 44),
                        textStyle: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: onBrowseDepartments,
                      icon: const Icon(Icons.grid_view_outlined),
                      label: const Text('Browse departments'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: AppColors.heroMuted),
                        minimumSize: const Size(184, 44),
                        textStyle: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PromiseStrip extends StatelessWidget {
  const PromiseStrip({
    required this.onOrders,
    required this.onSupport,
    required this.onBubu,
    required this.onSell,
    super.key,
  });

  final VoidCallback onOrders;
  final VoidCallback onSupport;
  final VoidCallback onBubu;
  final VoidCallback onSell;

  @override
  Widget build(BuildContext context) {
    final promises = <PromiseLink>[
      PromiseLink(
        icon: Icons.local_shipping_outlined,
        title: 'Fast Kampala delivery',
        body: 'Track orders and delivery windows',
        onTap: onOrders,
      ),
      PromiseLink(
        icon: Icons.assignment_return_outlined,
        title: 'Easy returns',
        body: 'Simple support for eligible items',
        onTap: onSupport,
      ),
      PromiseLink(
        icon: Icons.handshake_outlined,
        title: 'BUBU local picks',
        body: 'Support Ugandan sellers and makers',
        onTap: onBubu,
      ),
      PromiseLink(
        icon: Icons.storefront_outlined,
        title: 'Sell with Klein',
        body: 'Reach shoppers across Uganda',
        onTap: onSell,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 2),
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children:
            promises.map((promise) {
              return SizedBox(
                width: (MediaQuery.sizeOf(context).width - 38) / 2,
                child: LinkTile(
                  icon: promise.icon,
                  title: promise.title,
                  body: promise.body,
                  onTap: promise.onTap,
                ),
              );
            }).toList(),
      ),
    );
  }
}

class QuickActionPanel extends StatelessWidget {
  const QuickActionPanel({
    required this.onReorder,
    required this.onSaved,
    required this.onDelivery,
    required this.onPayment,
    super.key,
  });

  final VoidCallback onReorder;
  final VoidCallback onSaved;
  final VoidCallback onDelivery;
  final VoidCallback onPayment;

  @override
  Widget build(BuildContext context) {
    final actions = <PromiseLink>[
      PromiseLink(
        icon: Icons.history_outlined,
        title: 'Buy again',
        body: 'Repeat common orders',
        onTap: onReorder,
      ),
      PromiseLink(
        icon: Icons.favorite_border,
        title: 'Saved items',
        body: 'Keep products for later',
        onTap: onSaved,
      ),
      PromiseLink(
        icon: Icons.schedule_outlined,
        title: 'Delivery slots',
        body: 'Choose a convenient window',
        onTap: onDelivery,
      ),
      PromiseLink(
        icon: Icons.payments_outlined,
        title: 'Payments',
        body: 'Mobile money, card, or cash',
        onTap: onPayment,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final columns = constraints.maxWidth >= 720 ? 4 : 2;
          const gap = 10.0;
          final width =
              (constraints.maxWidth - (gap * (columns - 1))) / columns;

          return Wrap(
            spacing: gap,
            runSpacing: gap,
            children:
                actions.map((action) {
                  return SizedBox(
                    width: width,
                    child: LinkTile(
                      icon: action.icon,
                      title: action.title,
                      body: action.body,
                      onTap: action.onTap,
                    ),
                  );
                }).toList(),
          );
        },
      ),
    );
  }
}

class CategoryRail extends StatelessWidget {
  const CategoryRail({
    required this.activeCategory,
    required this.onSelectCategory,
    super.key,
  });

  final String activeCategory;
  final ValueChanged<String> onSelectCategory;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children:
            categories.map((category) {
              final active = activeCategory == category.id;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  selected: active,
                  label: Text(category.label),
                  avatar: Icon(
                    category.icon,
                    size: 17,
                    color: active ? AppColors.danger : AppColors.link,
                  ),
                  onSelected: (_) => onSelectCategory(category.id),
                  labelStyle: TextStyle(
                    color: active ? AppColors.danger : AppColors.ink,
                    fontWeight: FontWeight.w800,
                  ),
                  selectedColor: AppColors.chipActive,
                  backgroundColor: AppColors.panel,
                  side: BorderSide(
                    color: active ? AppColors.accentStrong : AppColors.line,
                  ),
                  showCheckmark: false,
                ),
              );
            }).toList(),
      ),
    );
  }
}

class CollectionGrid extends StatelessWidget {
  const CollectionGrid({required this.onSelectCategory, super.key});

  final ValueChanged<String> onSelectCategory;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 4, 14, 0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final columns = constraints.maxWidth >= 720 ? 4 : 2;
          const gap = 10.0;
          final width =
              (constraints.maxWidth - (gap * (columns - 1))) / columns;

          return Wrap(
            spacing: gap,
            runSpacing: gap,
            children:
                collections.map((collection) {
                  return SizedBox(
                    width: width,
                    child: CollectionCard(
                      collection: collection,
                      onTap: () => onSelectCategory(collection.category),
                    ),
                  );
                }).toList(),
          );
        },
      ),
    );
  }
}

class CollectionCard extends StatelessWidget {
  const CollectionCard({
    required this.collection,
    required this.onTap,
    super.key,
  });

  final Collection collection;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.panel,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.line),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(8),
                ),
                child: SizedBox(
                  height: 118,
                  width: double.infinity,
                  child: NetworkImageView(
                    url: collection.image,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(11, 10, 11, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      collection.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      collection.linkLabel,
                      style: const TextStyle(
                        color: AppColors.link,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DepartmentBand extends StatelessWidget {
  const DepartmentBand({required this.onSelectCategory, super.key});

  final ValueChanged<String> onSelectCategory;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        SectionHeading(
          title: 'Shop by department',
          actionLabel: 'View all',
          onAction: () => onSelectCategory('all'),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth >= 720 ? 4 : 2;
              const gap = 10.0;
              final width =
                  (constraints.maxWidth - (gap * (columns - 1))) / columns;
              final shortcuts = departmentShortcutIds.map(categoryForId);

              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children:
                    shortcuts.map((category) {
                      return SizedBox(
                        width: width,
                        child: DepartmentShortcut(
                          category: category,
                          onTap: () => onSelectCategory(category.id),
                        ),
                      );
                    }).toList(),
              );
            },
          ),
        ),
      ],
    );
  }
}

class DepartmentShortcut extends StatelessWidget {
  const DepartmentShortcut({
    required this.category,
    required this.onTap,
    super.key,
  });

  final StoreCategory category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.panel,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.line),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.soft,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Icon(category.icon, color: AppColors.link, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      category.description,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      category.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProductRail extends StatelessWidget {
  const ProductRail({
    required this.title,
    required this.products,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.savedProductIds,
    this.actionLabel,
    this.onAction,
    super.key,
  });

  final String title;
  final String? actionLabel;
  final List<Product> products;
  final VoidCallback? onAction;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final Set<int> savedProductIds;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        SectionHeading(
          title: title,
          actionLabel: actionLabel,
          onAction: onAction,
        ),
        HorizontalProductRail(
          products: products,
          emptyText: 'No products are available in this section yet.',
          onAdd: onAdd,
          onOpen: onOpen,
          onToggleSaved: onToggleSaved,
          savedProductIds: savedProductIds,
        ),
      ],
    );
  }
}

class PromoBanner extends StatelessWidget {
  const PromoBanner({
    required this.kicker,
    required this.title,
    required this.actionLabel,
    required this.onTap,
    super.key,
  });

  final String kicker;
  final String title;
  final String actionLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(14, 20, 14, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.navAlt,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  kicker.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.logoTag,
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          FilledButton(
            onPressed: onTap,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.accent,
              foregroundColor: AppColors.ink,
              textStyle: const TextStyle(fontWeight: FontWeight.w900),
            ),
            child: Text(actionLabel),
          ),
        ],
      ),
    );
  }
}

class LocalMakerSection extends StatelessWidget {
  const LocalMakerSection({
    required this.products,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.savedProductIds,
    required this.onSellerTap,
    super.key,
  });

  final List<Product> products;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final Set<int> savedProductIds;
  final VoidCallback onSellerTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(14, 20, 14, 0),
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
      decoration: BoxDecoration(
        color: AppColors.soft,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'BUBU MARKETPLACE',
            style: TextStyle(
              color: AppColors.link,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 7),
          const Text(
            'Buy Uganda, Build Uganda with local coffee, baskets, crafts, pantry goods, and home pieces.',
            style: TextStyle(
              color: AppColors.ink,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: onSellerTap,
            icon: const Icon(Icons.storefront_outlined),
            label: const Text('Become a local seller'),
          ),
          const SizedBox(height: 12),
          HorizontalProductRail(
            products: products,
            emptyText: 'No local products are available yet.',
            onAdd: onAdd,
            onOpen: onOpen,
            onToggleSaved: onToggleSaved,
            savedProductIds: savedProductIds,
          ),
        ],
      ),
    );
  }
}

class SectionHeading extends StatelessWidget {
  const SectionHeading({
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    super.key,
  });

  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 22, 14, 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                if (subtitle != null) ...<Widget>[
                  const SizedBox(height: 3),
                  Text(
                    subtitle!,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      height: 1.3,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (actionLabel != null)
            TextButton(
              onPressed: onAction,
              child: Text(
                actionLabel!,
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
        ],
      ),
    );
  }
}

class ScreenIntro extends StatelessWidget {
  const ScreenIntro({required this.title, required this.subtitle, super.key});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 26,
              fontWeight: FontWeight.w900,
              height: 1.08,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 14,
              fontWeight: FontWeight.w700,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class HorizontalProductRail extends StatelessWidget {
  const HorizontalProductRail({
    required this.products,
    required this.emptyText,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.savedProductIds,
    super.key,
  });

  final List<Product> products;
  final String emptyText;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final Set<int> savedProductIds;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return EmptyText(text: emptyText);
    }

    return SizedBox(
      height: 390,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemBuilder: (context, index) {
          final product = products[index];
          return SizedBox(
            width: 214,
            child: ProductCard(
              product: product,
              isSaved: savedProductIds.contains(product.id),
              onAdd: () => onAdd(product),
              onOpen: () => onOpen(product),
              onToggleSaved: () => onToggleSaved(product),
            ),
          );
        },
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemCount: products.length,
      ),
    );
  }
}

class ProductGrid extends StatelessWidget {
  const ProductGrid({
    required this.products,
    required this.emptyText,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    required this.savedProductIds,
    super.key,
  });

  final List<Product> products;
  final String emptyText;
  final ValueChanged<Product> onAdd;
  final ValueChanged<Product> onOpen;
  final ValueChanged<Product> onToggleSaved;
  final Set<int> savedProductIds;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return EmptyText(text: emptyText);
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 720 ? 3 : 2;
        const gap = 10.0;
        final width =
            (constraints.maxWidth - 28 - (gap * (columns - 1))) / columns;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children:
                products.map((product) {
                  return SizedBox(
                    width: width,
                    height: 390,
                    child: ProductCard(
                      product: product,
                      isSaved: savedProductIds.contains(product.id),
                      onAdd: () => onAdd(product),
                      onOpen: () => onOpen(product),
                      onToggleSaved: () => onToggleSaved(product),
                    ),
                  );
                }).toList(),
          ),
        );
      },
    );
  }
}

class ProductCard extends StatelessWidget {
  const ProductCard({
    required this.product,
    required this.isSaved,
    required this.onAdd,
    required this.onOpen,
    required this.onToggleSaved,
    super.key,
  });

  final Product product;
  final bool isSaved;
  final VoidCallback onAdd;
  final VoidCallback onOpen;
  final VoidCallback onToggleSaved;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.panel,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onOpen,
        child: Container(
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.line),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: SizedBox(
                  height: 118,
                  width: double.infinity,
                  child: Stack(
                    fit: StackFit.expand,
                    children: <Widget>[
                      NetworkImageView(url: product.image, fit: BoxFit.cover),
                      Positioned(
                        top: 7,
                        right: 7,
                        child: IconButton.filledTonal(
                          onPressed: onToggleSaved,
                          style: IconButton.styleFrom(
                            backgroundColor: Colors.white.withValues(
                              alpha: 0.9,
                            ),
                            foregroundColor:
                                isSaved ? AppColors.danger : AppColors.link,
                            minimumSize: const Size(34, 34),
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          icon: Icon(
                            isSaved ? Icons.favorite : Icons.favorite_border,
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: <Widget>[
                  BadgeLabel(text: product.badge),
                  if (product.isLocal)
                    const BadgeLabel(
                      text: 'Local seller',
                      backgroundColor: AppColors.soft,
                      foregroundColor: AppColors.link,
                    ),
                ],
              ),
              const SizedBox(height: 7),
              Text(
                product.name,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.ink,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${stars(product.rating)} ${product.rating}',
                style: const TextStyle(
                  color: AppColors.warning,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 7),
              Text(
                money(product.price),
                style: const TextStyle(
                  color: AppColors.ink,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 3),
              const Text(
                'FREE delivery by Wednesday',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 12,
                  height: 1.3,
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: onAdd,
                  icon: const Icon(Icons.add_shopping_cart, size: 17),
                  label: const Text('Add to cart'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: AppColors.ink,
                    minimumSize: const Size.fromHeight(38),
                    textStyle: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProductDetailSheet extends StatelessWidget {
  const ProductDetailSheet({
    required this.product,
    required this.isSaved,
    required this.onAdd,
    required this.onToggleSaved,
    super.key,
  });

  final Product product;
  final bool isSaved;
  final VoidCallback onAdd;
  final VoidCallback onToggleSaved;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.88,
        ),
        decoration: const BoxDecoration(
          color: AppColors.panel,
          borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Center(
                child: Container(
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.line,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: <Widget>[
                  const Expanded(
                    child: Text(
                      'Product details',
                      style: TextStyle(
                        color: AppColors.ink,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  IconButton.outlined(
                    onPressed: onToggleSaved,
                    icon: Icon(
                      isSaved ? Icons.favorite : Icons.favorite_border,
                    ),
                    color: isSaved ? AppColors.danger : AppColors.link,
                  ),
                  const SizedBox(width: 8),
                  IconButton.outlined(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  height: 226,
                  width: double.infinity,
                  child: NetworkImageView(
                    url: product.image,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: <Widget>[
                  BadgeLabel(text: product.badge),
                  BadgeLabel(
                    text: categoryLabelFor(product.category),
                    backgroundColor: AppColors.soft,
                    foregroundColor: AppColors.link,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                product.name,
                style: const TextStyle(
                  color: AppColors.ink,
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${stars(product.rating)} ${product.rating}',
                style: const TextStyle(
                  color: AppColors.warning,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                money(product.price),
                style: const TextStyle(
                  color: AppColors.ink,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'FREE delivery by Wednesday in selected Kampala areas.',
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 14,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 12),
              ...product.details.map((detail) => DetailBullet(text: detail)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: onAdd,
                  icon: const Icon(Icons.add_shopping_cart),
                  label: const Text('Add to cart'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: AppColors.ink,
                    minimumSize: const Size.fromHeight(46),
                    textStyle: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DetailBullet extends StatelessWidget {
  const DetailBullet({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Padding(
            padding: EdgeInsets.only(top: 4),
            child: Icon(Icons.check_circle, color: AppColors.link, size: 17),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: AppColors.ink,
                fontSize: 14,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CartLine extends StatelessWidget {
  const CartLine({
    required this.entry,
    required this.onAdd,
    required this.onRemove,
    super.key,
  });

  final CartEntry entry;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(14, 10, 14, 0),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.panel,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: <Widget>[
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 78,
              height: 78,
              child: NetworkImageView(
                url: entry.product.image,
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  entry.product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  money(entry.product.price),
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  width: 118,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: AppColors.line),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      IconButton(
                        onPressed: onRemove,
                        icon: const Icon(Icons.remove, size: 17),
                        color: AppColors.link,
                        padding: EdgeInsets.zero,
                      ),
                      Text(
                        '${entry.quantity}',
                        style: const TextStyle(
                          color: AppColors.ink,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      IconButton(
                        onPressed: onAdd,
                        icon: const Icon(Icons.add, size: 17),
                        color: AppColors.link,
                        padding: EdgeInsets.zero,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class DeliveryChoicePanel extends StatelessWidget {
  const DeliveryChoicePanel({required this.hasItems, super.key});

  final bool hasItems;

  @override
  Widget build(BuildContext context) {
    if (!hasItems) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(14, 14, 14, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.panel,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Delivery slot',
            style: TextStyle(
              color: AppColors.ink,
              fontSize: 17,
              fontWeight: FontWeight.w900,
            ),
          ),
          SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              Chip(
                avatar: Icon(Icons.wb_sunny_outlined, size: 17),
                label: Text('Today, 2-5 PM'),
                backgroundColor: AppColors.chipActive,
                side: BorderSide(color: AppColors.accentStrong),
              ),
              Chip(
                avatar: Icon(Icons.nightlight_round, size: 17),
                label: Text('Tonight, 6-9 PM'),
                backgroundColor: AppColors.panel,
                side: BorderSide(color: AppColors.line),
              ),
              Chip(
                avatar: Icon(Icons.calendar_today_outlined, size: 17),
                label: Text('Tomorrow morning'),
                backgroundColor: AppColors.panel,
                side: BorderSide(color: AppColors.line),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SummaryLine extends StatelessWidget {
  const SummaryLine({required this.label, required this.value, super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.ink,
            fontSize: 14,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class TotalPanel extends StatelessWidget {
  const TotalPanel({
    required this.total,
    required this.hasItems,
    required this.savedCount,
    required this.onCheckout,
    super.key,
  });

  final int total;
  final bool hasItems;
  final int savedCount;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    final deliveryFee = hasItems && total < 130000 ? 8000 : 0;
    final estimatedSavings = hasItems ? (total * 0.08).round() : 0;
    final due = total + deliveryFee;

    return Container(
      margin: const EdgeInsets.fromLTRB(14, 14, 14, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.panel,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: <Widget>[
          SummaryLine(label: 'Items subtotal', value: money(total)),
          const SizedBox(height: 8),
          SummaryLine(
            label: 'Delivery',
            value: deliveryFee == 0 ? 'Free' : money(deliveryFee),
          ),
          const SizedBox(height: 8),
          SummaryLine(
            label: 'Estimated deal savings',
            value: '-${money(estimatedSavings)}',
          ),
          if (savedCount > 0) ...<Widget>[
            const SizedBox(height: 8),
            SummaryLine(
              label: 'Saved for later',
              value: '$savedCount item${savedCount == 1 ? '' : 's'}',
            ),
          ],
          const Divider(height: 24),
          Row(
            children: <Widget>[
              const Expanded(
                child: Text(
                  'Estimated total',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Text(
                money(due),
                style: const TextStyle(
                  color: AppColors.ink,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: hasItems ? onCheckout : null,
              icon: const Icon(Icons.shopping_cart_checkout_outlined),
              label: const Text('Proceed to checkout'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: AppColors.ink,
                disabledBackgroundColor: AppColors.line,
                disabledForegroundColor: AppColors.muted,
                minimumSize: const Size.fromHeight(44),
                textStyle: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StoreBottomNavigation extends StatelessWidget {
  const StoreBottomNavigation({
    required this.currentIndex,
    required this.cartCount,
    required this.onTap,
    super.key,
  });

  final int currentIndex;
  final int cartCount;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onTap,
      indicatorColor: AppColors.soft,
      backgroundColor: AppColors.panel,
      destinations: <Widget>[
        const NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home),
          label: 'Home',
        ),
        const NavigationDestination(
          icon: Icon(Icons.local_offer_outlined),
          selectedIcon: Icon(Icons.local_offer),
          label: 'Deals',
        ),
        const NavigationDestination(
          icon: Icon(Icons.grid_view_outlined),
          selectedIcon: Icon(Icons.grid_view),
          label: 'Departments',
        ),
        const NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person),
          label: 'Account',
        ),
        NavigationDestination(
          icon: Badge(
            isLabelVisible: cartCount > 0,
            label: Text('$cartCount'),
            child: const Icon(Icons.shopping_cart_outlined),
          ),
          selectedIcon: Badge(
            isLabelVisible: cartCount > 0,
            label: Text('$cartCount'),
            child: const Icon(Icons.shopping_cart),
          ),
          label: 'Cart',
        ),
      ],
    );
  }
}

class LinkPanel extends StatelessWidget {
  const LinkPanel({
    required this.icon,
    required this.title,
    required this.body,
    required this.onTap,
    super.key,
  });

  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
      child: LinkTile(icon: icon, title: title, body: body, onTap: onTap),
    );
  }
}

class LinkTile extends StatelessWidget {
  const LinkTile({
    required this.icon,
    required this.title,
    required this.body,
    required this.onTap,
    super.key,
  });

  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.panel,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.line),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.soft,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Icon(icon, color: AppColors.link, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      body,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class EmptyPanel extends StatelessWidget {
  const EmptyPanel({required this.title, required this.body, super.key});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(14, 12, 14, 0),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.panel,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 14,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class EmptyText extends StatelessWidget {
  const EmptyText({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(14, 12, 14, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.panel,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: AppColors.muted,
          fontSize: 14,
          height: 1.4,
        ),
      ),
    );
  }
}

class BadgeLabel extends StatelessWidget {
  const BadgeLabel({
    required this.text,
    this.backgroundColor = AppColors.navAlt,
    this.foregroundColor = Colors.white,
    super.key,
  });

  final String text;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(3),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Text(
          text,
          style: TextStyle(
            color: foregroundColor,
            fontSize: 11,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class NetworkImageView extends StatelessWidget {
  const NetworkImageView({required this.url, required this.fit, super.key});

  final String url;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    return Image.network(
      url,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: AppColors.soft,
          alignment: Alignment.center,
          child: const Icon(
            Icons.image_not_supported_outlined,
            color: AppColors.muted,
          ),
        );
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) {
          return child;
        }
        return Container(
          color: AppColors.soft,
          alignment: Alignment.center,
          child: const SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        );
      },
    );
  }
}

class AppColors {
  static const Color ink = Color(0xFF17212B);
  static const Color muted = Color(0xFF667085);
  static const Color nav = Color(0xFF063B3F);
  static const Color navAlt = Color(0xFF4B244A);
  static const Color accent = Color(0xFFFF8A5B);
  static const Color accentStrong = Color(0xFFF06F45);
  static const Color link = Color(0xFF007F73);
  static const Color page = Color(0xFFEDF7F4);
  static const Color panel = Color(0xFFFFFDF8);
  static const Color line = Color(0xFFD9E3DF);
  static const Color soft = Color(0xFFE6F8F3);
  static const Color chipActive = Color(0xFFFFF0E8);
  static const Color warning = Color(0xFFD97706);
  static const Color danger = Color(0xFFB8442F);
  static const Color headerMuted = Color(0xFFCBE7E1);
  static const Color heroMuted = Color(0xFFE6F8F3);
  static const Color logoTag = Color(0xFFFFD6C4);
}

class StoreCategory {
  const StoreCategory({
    required this.id,
    required this.label,
    required this.description,
    required this.icon,
  });

  final String id;
  final String label;
  final String description;
  final IconData icon;
}

class Collection {
  const Collection({
    required this.title,
    required this.linkLabel,
    required this.category,
    required this.image,
  });

  final String title;
  final String linkLabel;
  final String category;
  final String image;
}

class PromiseLink {
  const PromiseLink({
    required this.icon,
    required this.title,
    required this.body,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onTap;
}

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.rating,
    required this.badge,
    required this.tags,
    required this.details,
    required this.image,
  });

  final int id;
  final String name;
  final String category;
  final int price;
  final double rating;
  final String badge;
  final List<String> tags;
  final List<String> details;
  final String image;

  bool get isDeal => tags.contains('deals');

  bool get isLocal => tags.contains('local');

  bool matchesCategory(String filter) {
    return filter == 'all' || category == filter || tags.contains(filter);
  }

  bool matchesQuery(String query) {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) {
      return true;
    }

    final searchable =
        '$name $category $badge ${tags.join(' ')} ${details.join(' ')}'
            .toLowerCase();
    return searchable.contains(normalized);
  }
}

class CartEntry {
  const CartEntry({required this.product, required this.quantity});

  final Product product;
  final int quantity;
}

String money(int value) {
  final digits = value.toString();
  final output = StringBuffer();

  for (var i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 == 0) {
      output.write(',');
    }
    output.write(digits[i]);
  }

  return 'UGX $output';
}

String stars(double rating) {
  final full = rating.round().clamp(0, 5).toInt();
  return '${List.filled(full, '*').join()}${List.filled(5 - full, '-').join()}';
}

String categoryLabelFor(String id) {
  return categoryForId(id).label;
}

StoreCategory categoryForId(String id) {
  return categories.firstWhere(
    (category) => category.id == id,
    orElse:
        () => const StoreCategory(
          id: 'all',
          label: 'All',
          description: 'Everything',
          icon: Icons.apps_outlined,
        ),
  );
}

List<Product> productsFor(String filter, {int limit = 8}) {
  return products
      .where((product) => product.matchesCategory(filter))
      .take(limit)
      .toList();
}

const String heroImage =
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80';

const List<String> departmentShortcutIds = <String>[
  'electronics',
  'grocery',
  'appliances',
  'office',
  'baby',
  'sports',
  'automotive',
  'bubu',
];

const List<StoreCategory> categories = <StoreCategory>[
  StoreCategory(
    id: 'all',
    label: 'All',
    description: 'Everything',
    icon: Icons.apps_outlined,
  ),
  StoreCategory(
    id: 'deals',
    label: 'Deals',
    description: 'Today only',
    icon: Icons.local_offer_outlined,
  ),
  StoreCategory(
    id: 'electronics',
    label: 'Electronics',
    description: 'Devices',
    icon: Icons.devices_other,
  ),
  StoreCategory(
    id: 'home',
    label: 'Home & Kitchen',
    description: 'Home goods',
    icon: Icons.home_work_outlined,
  ),
  StoreCategory(
    id: 'fashion',
    label: 'Fashion',
    description: 'Style',
    icon: Icons.checkroom_outlined,
  ),
  StoreCategory(
    id: 'beauty',
    label: 'Beauty',
    description: 'Care',
    icon: Icons.spa_outlined,
  ),
  StoreCategory(
    id: 'grocery',
    label: 'Grocery',
    description: 'Fresh and pantry',
    icon: Icons.local_grocery_store_outlined,
  ),
  StoreCategory(
    id: 'appliances',
    label: 'Appliances',
    description: 'Big and small',
    icon: Icons.kitchen_outlined,
  ),
  StoreCategory(
    id: 'office',
    label: 'Office',
    description: 'Work smarter',
    icon: Icons.business_center_outlined,
  ),
  StoreCategory(
    id: 'baby',
    label: 'Baby',
    description: 'Care and nursery',
    icon: Icons.child_care_outlined,
  ),
  StoreCategory(
    id: 'sports',
    label: 'Sports',
    description: 'Active life',
    icon: Icons.sports_basketball_outlined,
  ),
  StoreCategory(
    id: 'automotive',
    label: 'Automotive',
    description: 'Car care',
    icon: Icons.directions_car_outlined,
  ),
  StoreCategory(
    id: 'books',
    label: 'Books',
    description: 'Read more',
    icon: Icons.menu_book_outlined,
  ),
  StoreCategory(
    id: 'toys',
    label: 'Toys',
    description: 'Kids',
    icon: Icons.toys_outlined,
  ),
  StoreCategory(
    id: 'garden',
    label: 'Garden',
    description: 'Grow',
    icon: Icons.yard_outlined,
  ),
  StoreCategory(
    id: 'pets',
    label: 'Pets',
    description: 'Pet care',
    icon: Icons.pets_outlined,
  ),
  StoreCategory(
    id: 'bubu',
    label: 'BUBU',
    description: 'Made near you',
    icon: Icons.handshake_outlined,
  ),
];

const List<Collection> collections = <Collection>[
  Collection(
    title: 'Refresh your space',
    linkLabel: 'Shop home',
    category: 'home',
    image:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  ),
  Collection(
    title: 'Electronics for work and play',
    linkLabel: 'Explore devices',
    category: 'electronics',
    image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  ),
  Collection(
    title: 'Style picks under UGX 200,000',
    linkLabel: 'Shop fashion',
    category: 'fashion',
    image:
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80',
  ),
  Collection(
    title: 'Groceries and daily basics',
    linkLabel: 'Shop fresh',
    category: 'grocery',
    image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  ),
];

const List<Product> products = <Product>[
  Product(
    id: 1,
    name: 'Echo Bluetooth Speaker with room-filling bass',
    category: 'electronics',
    price: 200000,
    rating: 4.6,
    badge: '28% off',
    tags: <String>['deals', 'audio'],
    details: <String>[
      'Portable wireless sound',
      'Rechargeable battery',
      'Great for bedrooms, shops, and small events',
    ],
    image:
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 2,
    name: 'AeroPods wireless earbuds with charging case',
    category: 'electronics',
    price: 205000,
    rating: 4.4,
    badge: 'Deal',
    tags: <String>['deals', 'audio'],
    details: <String>[
      'Compact charging case',
      'Clear calls and music',
      'Lightweight daily carry',
    ],
    image:
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 3,
    name: 'UltraView 27-inch monitor for work and gaming',
    category: 'electronics',
    price: 680000,
    rating: 4.7,
    badge: 'Limited time',
    tags: <String>['deals', 'office'],
    details: <String>[
      'Wide workspace display',
      'Sharp color and contrast',
      'Useful for work, school, and gaming',
    ],
    image:
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 4,
    name: 'Smart home hub with voice control',
    category: 'electronics',
    price: 260000,
    rating: 4.5,
    badge: 'Best seller',
    tags: <String>['smart home'],
    details: <String>[
      'Control compatible devices',
      'Hands-free voice commands',
      'Compact bedside-friendly design',
    ],
    image:
        'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 5,
    name: 'Nonstick ceramic cookware set, 10 pieces',
    category: 'home',
    price: 340000,
    rating: 4.8,
    badge: '30% off',
    tags: <String>['deals', 'kitchen', 'appliances'],
    details: <String>[
      'Easy-clean cooking surface',
      'Saucepans, frying pans, and lids',
      'Good starter set for any kitchen',
    ],
    image:
        'https://images.unsplash.com/photo-1584990347449-a2d4cfe5cf5f?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 6,
    name: 'Cotton hotel towel bundle, soft absorbent set',
    category: 'home',
    price: 125000,
    rating: 4.3,
    badge: 'Deal',
    tags: <String>['deals', 'bath'],
    details: <String>[
      'Soft cotton feel',
      'Multiple towel sizes',
      'Fresh upgrade for home or guest rooms',
    ],
    image:
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 7,
    name: 'Adjustable LED desk lamp with USB charging',
    category: 'home',
    price: 95000,
    rating: 4.4,
    badge: 'Coupon',
    tags: <String>['office', 'lighting'],
    details: <String>[
      'Flexible lamp arm',
      'Built-in USB charging',
      'Useful for reading, study, and work desks',
    ],
    image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 8,
    name: 'Compact espresso maker with milk frother',
    category: 'appliances',
    price: 455000,
    rating: 4.6,
    badge: '15% off',
    tags: <String>['home', 'deals', 'coffee'],
    details: <String>[
      'Compact counter footprint',
      'Steam wand for milk drinks',
      'Cafe-style drinks at home',
    ],
    image:
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 9,
    name: 'Everyday canvas tote with zip pocket',
    category: 'fashion',
    price: 105000,
    rating: 4.2,
    badge: 'Under UGX 120k',
    tags: <String>['bags'],
    details: <String>[
      'Durable canvas body',
      'Secure zip pocket',
      'Easy for errands, campus, or travel',
    ],
    image:
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 10,
    name: 'Minimal white sneakers for travel and weekends',
    category: 'fashion',
    price: 180000,
    rating: 4.5,
    badge: 'Deal',
    tags: <String>['deals', 'shoes'],
    details: <String>[
      'Clean everyday style',
      'Comfortable walking sole',
      'Pairs well with casual outfits',
    ],
    image:
        'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 11,
    name: 'Classic cotton hoodie in soft fleece',
    category: 'fashion',
    price: 162000,
    rating: 4.4,
    badge: 'New',
    tags: <String>['clothing'],
    details: <String>[
      'Soft fleece lining',
      'Relaxed daily fit',
      'Layer for cool evenings',
    ],
    image:
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 12,
    name: 'Hydrating skincare starter kit for daily glow',
    category: 'beauty',
    price: 139000,
    rating: 4.7,
    badge: 'Best seller',
    tags: <String>['wellness'],
    details: <String>[
      'Daily cleanser and moisturizer',
      'Travel-friendly starter sizes',
      'Simple routine for morning and evening',
    ],
    image:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 13,
    name: 'Fresh fruit and vegetable family box',
    category: 'grocery',
    price: 85000,
    rating: 4.6,
    badge: 'Fresh',
    tags: <String>['fresh', 'deals'],
    details: <String>[
      'Seasonal fruit and vegetables',
      'Packed for family meals',
      'Good for weekly kitchen top-ups',
    ],
    image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 14,
    name: 'Ugandan roasted coffee beans, 1kg',
    category: 'bubu',
    price: 68000,
    rating: 4.8,
    badge: 'BUBU',
    tags: <String>['grocery', 'coffee', 'local'],
    details: <String>[
      'Locally roasted coffee',
      'Rich aroma for home brewing',
      'Supports Ugandan growers and roasters',
    ],
    image:
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 15,
    name: 'Pantry staples bundle with rice, beans and oil',
    category: 'grocery',
    price: 118000,
    rating: 4.5,
    badge: 'Bundle',
    tags: <String>['fresh', 'deals'],
    details: <String>[
      'Useful everyday staples',
      'Great for monthly shopping',
      'Packed for easy delivery',
    ],
    image:
        'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 16,
    name: 'Baby care starter pack with wipes and lotion',
    category: 'baby',
    price: 98000,
    rating: 4.6,
    badge: 'Parent pick',
    tags: <String>['care'],
    details: <String>[
      'Daily baby care essentials',
      'Gentle wipe and lotion bundle',
      'Handy gift for new parents',
    ],
    image:
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 17,
    name: 'Wireless keyboard and mouse office combo',
    category: 'office',
    price: 135000,
    rating: 4.3,
    badge: 'Office deal',
    tags: <String>['electronics', 'deals'],
    details: <String>[
      'Reliable wireless desk setup',
      'Comfortable full-size keyboard',
      'Useful for home offices and business desks',
    ],
    image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 18,
    name: 'Fitness training mat with carry strap',
    category: 'sports',
    price: 76000,
    rating: 4.4,
    badge: 'Active',
    tags: <String>['wellness'],
    details: <String>[
      'Comfortable exercise surface',
      'Easy carry strap',
      'Good for yoga, stretching, and home workouts',
    ],
    image:
        'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 19,
    name: 'Car interior cleaning and care kit',
    category: 'automotive',
    price: 89000,
    rating: 4.2,
    badge: 'Car care',
    tags: <String>['deals'],
    details: <String>[
      'Dashboard and interior cleaners',
      'Microfiber cloths included',
      'Keeps daily drives looking neat',
    ],
    image:
        'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 20,
    name: "Children's learning blocks and puzzle set",
    category: 'toys',
    price: 72000,
    rating: 4.5,
    badge: 'Kids',
    tags: <String>['baby'],
    details: <String>[
      'Colorful learning activities',
      'Builds coordination and focus',
      'Good gift for young children',
    ],
    image:
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 21,
    name: 'Bestselling business and personal finance books',
    category: 'books',
    price: 64000,
    rating: 4.4,
    badge: 'Read more',
    tags: <String>['office'],
    details: <String>[
      'Practical reading picks',
      'Useful for entrepreneurs and students',
      'A compact shelf upgrade',
    ],
    image:
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 22,
    name: 'Garden herb planter with starter seeds',
    category: 'garden',
    price: 58000,
    rating: 4.3,
    badge: 'Grow',
    tags: <String>['home'],
    details: <String>[
      'Starter herbs for balcony or kitchen',
      'Compact planter size',
      'Fresh flavor close at hand',
    ],
    image:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 23,
    name: 'Pet feeding bowl and grooming brush set',
    category: 'pets',
    price: 54000,
    rating: 4.2,
    badge: 'Pet care',
    tags: <String>['home'],
    details: <String>[
      'Daily feeding and grooming basics',
      'Easy-clean bowl',
      'Useful for cats and small dogs',
    ],
    image:
        'https://images.unsplash.com/photo-1601758063890-1167f394febb?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 24,
    name: 'Handwoven Ugandan storage basket',
    category: 'bubu',
    price: 74000,
    rating: 4.9,
    badge: 'BUBU',
    tags: <String>['home', 'local'],
    details: <String>[
      'Handwoven local design',
      'Decorative and practical storage',
      'Supports Ugandan craft makers',
    ],
    image:
        'https://images.unsplash.com/photo-1601933470096-0e34634ffcde?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 25,
    name: 'Locally made shea butter body cream',
    category: 'bubu',
    price: 42000,
    rating: 4.7,
    badge: 'BUBU',
    tags: <String>['beauty', 'local'],
    details: <String>[
      'Rich body cream texture',
      'Made with local ingredients',
      'Everyday moisture for dry skin',
    ],
    image:
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 26,
    name: 'Air fryer family-size kitchen appliance',
    category: 'appliances',
    price: 360000,
    rating: 4.6,
    badge: 'Hot deal',
    tags: <String>['home', 'deals'],
    details: <String>[
      'Family-size basket',
      'Crisp meals with less oil',
      'Easy controls and cleanup',
    ],
    image:
        'https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 27,
    name: 'Smartphone power bank, 20000mAh',
    category: 'electronics',
    price: 155000,
    rating: 4.5,
    badge: 'Travel pick',
    tags: <String>['deals', 'phones'],
    details: <String>[
      'High-capacity backup power',
      'Useful for travel and busy work days',
      'Charges phones and small devices',
    ],
    image:
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=640&q=80',
  ),
  Product(
    id: 28,
    name: 'Kampala weekend travel backpack',
    category: 'fashion',
    price: 149000,
    rating: 4.4,
    badge: 'Travel',
    tags: <String>['bags'],
    details: <String>[
      'Spacious compartments',
      'Comfortable shoulder straps',
      'Good for school, work, or weekend trips',
    ],
    image:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&q=80',
  ),
];
