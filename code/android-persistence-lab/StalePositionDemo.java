import java.util.ArrayList;
import java.util.List;

public class StalePositionDemo {

    interface RowAction {
        void run();
    }

    public static void main(String[] args) {
        System.out.println("=== BUGGY: capturing a plain int at registration time ===");
        runScenario(true);

        System.out.println();
        System.out.println("=== CORRECT: querying a live position at click time ===");
        runScenario(false);
    }

    static void runScenario(boolean useCapturedInt) {
        List<String> items = new ArrayList<>(List.of("Bolts", "Washers", "Nuts", "Screws"));
        int[] livePosition = { 2 }; // stands in for holder.getBindingAdapterPosition()'s real, live answer

        int capturedAtRegistrationTime = livePosition[0]; // captured now, frozen forever

        RowAction delete = useCapturedInt
            ? () -> {
                String removed = items.remove(capturedAtRegistrationTime);
                System.out.println("delete.run() removed index " + capturedAtRegistrationTime + " -> \"" + removed + "\"");
              }
            : () -> {
                String removed = items.remove(livePosition[0]);
                System.out.println("delete.run() removed index " + livePosition[0] + " -> \"" + removed + "\"");
              };

        System.out.println("items before         = " + items);
        System.out.println("row registered while showing index " + livePosition[0] + " (\"" + items.get(livePosition[0]) + "\")");

        String removedElsewhere = items.remove(0);
        livePosition[0] = livePosition[0] - 1;
        System.out.println("removed elsewhere    = \"" + removedElsewhere + "\"");
        System.out.println("items after shift    = " + items);
        System.out.println("row's real current item is now index " + livePosition[0] + " (\"" + items.get(livePosition[0]) + "\")");

        System.out.println("user taps delete on that SAME physical row");
        delete.run();
        System.out.println("items after tap      = " + items);
    }
}
