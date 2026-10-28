import 'package:flutter_test/flutter_test.dart';
import 'package:klein_shoppers/main.dart';

void main() {
  testWidgets('renders storefront and adds an item to the cart', (
    tester,
  ) async {
    await tester.pumpWidget(const KleinShoppersApp());

    expect(
      find.text(
        'Shop daily essentials, tech, fashion, and Ugandan-made finds in one place.',
      ),
      findsOneWidget,
    );

    await tester.tap(find.text('Deals').last);
    await tester.pumpAndSettle();

    expect(find.text('Trending deals'), findsOneWidget);

    final addButton = find.text('Add to cart').first;

    await tester.ensureVisible(addButton);
    await tester.pumpAndSettle();

    await tester.tap(addButton);
    await tester.pump();

    expect(find.text('1'), findsWidgets);

    await tester.tap(find.text('Departments').last);
    await tester.pumpAndSettle();

    expect(find.text('Shop by department'), findsWidgets);
  });
}
