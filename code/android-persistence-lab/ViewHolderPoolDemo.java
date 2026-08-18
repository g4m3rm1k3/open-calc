public class ViewHolderPoolDemo {

    static int expensiveSetupCount = 0;
    static int cheapRebindCount = 0;

    static class Slot {
        final String cachedLabel;

        Slot(int slotNumber) {
            expensiveSetupCount++;
            cachedLabel = "Slot#" + slotNumber;
            System.out.println("[SETUP]  " + cachedLabel + " built (expensive setup #" + expensiveSetupCount + ")");
        }

        void rebind(String dataItem) {
            cheapRebindCount++;
            System.out.println("[REBIND] " + cachedLabel + " now showing " + dataItem + " (rebind #" + cheapRebindCount + ")");
        }
    }

    public static void main(String[] args) {
        String[] dataset = {
            "Item-0", "Item-1", "Item-2", "Item-3", "Item-4",
            "Item-5", "Item-6", "Item-7", "Item-8"
        };

        Slot[] pool = new Slot[3];
        for (int i = 0; i < pool.length; i++) {
            pool[i] = new Slot(i);
        }

        for (int i = 0; i < dataset.length; i++) {
            Slot reused = pool[i % pool.length];
            reused.rebind(dataset[i]);
        }

        System.out.println();
        System.out.println("dataset.length      = " + dataset.length);
        System.out.println("expensiveSetupCount = " + expensiveSetupCount);
        System.out.println("cheapRebindCount    = " + cheapRebindCount);
    }
}
