public class OverloadResolutionDemo {

    static void display(String text) {
        System.out.println("[String overload] showing text: " + text);
    }

    static void display(int resourceId) {
        System.out.println("[int overload]    looking up resource id: " + resourceId + " (this is almost certainly NOT what was intended)");
    }

    public static void main(String[] args) {
        int quantity = 12;

        display(String.valueOf(quantity)); // explicit conversion -- picks the String overload
        display(quantity);                  // no conversion -- compiles fine, silently picks the int overload instead
    }
}
