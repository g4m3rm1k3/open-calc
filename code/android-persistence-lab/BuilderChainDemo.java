public class BuilderChainDemo {

    static class Message {
        String title = "";
        String body = "";

        Message setTitle(String t) {
            this.title = t;
            return this;
        }

        Message setBody(String b) {
            this.body = b;
            return this;
        }

        String describe() {
            return "[" + title + "] " + body;
        }
    }

    public static void main(String[] args) {
        Message m = new Message().setTitle("Update Quantity").setBody("Enter a new value");
        System.out.println(m.describe());
    }
}
