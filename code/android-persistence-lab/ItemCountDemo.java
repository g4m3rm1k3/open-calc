import java.util.ArrayList;
import java.util.List;

public class ItemCountDemo {

    public static void main(String[] args) {
        List<String> items = new ArrayList<>();
        System.out.println("items.size() on an empty list = " + items.size());

        items.add("Bolts");
        items.add("Washers");
        items.add("Nuts");
        System.out.println("after 3 adds, items.size()    = " + items.size());

        items.remove(0);
        System.out.println("after 1 removal, items.size() = " + items.size());

        int count = items.size();
        System.out.println();
        System.out.println("valid position range for this list: 0 <= position < " + count);
        for (int position = 0; position < count; position++) {
            System.out.println("  position " + position + " -> " + items.get(position));
        }
    }
}
