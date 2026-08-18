public class BuilderChainBroken {

    static class Message {
        String title = "";
        String body = "";

        void setTitle(String t) {
            this.title = t;
        }

        Message setBody(String b) {
            this.body = b;
            return this;
        }
    }

    public static void main(String[] args) {
        Message m = new Message().setTitle("Update Quantity").setBody("Enter a new value");
    }
}
