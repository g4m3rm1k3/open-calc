import java.util.ArrayList;
import java.util.List;

public class LayoutInflationDemo {

    static int inflateCallCount = 0;

    static class Environment {
        final String theme;
        Environment(String theme) { this.theme = theme; }
    }

    static class Widget {
        final String description;
        Widget(String description) {
            this.description = description;
        }
        @Override
        public String toString() {
            return "Widget[" + description + "]";
        }
    }

    static class Container {
        final List<Widget> children = new ArrayList<>();
        void attach(Widget widget) {
            children.add(widget);
        }
    }

    static class Inflater {
        final Environment environment;

        private Inflater(Environment environment) {
            this.environment = environment;
        }

        static Inflater from(Environment environment) {
            return new Inflater(environment);
        }

        Widget inflate(String description, Container intendedParent, boolean attachNow) {
            inflateCallCount++;
            System.out.println("[INFLATE] building \"" + description + "\" using theme \"" + environment.theme + "\" (call #" + inflateCallCount + ")");
            Widget built = new Widget(description);
            if (attachNow) {
                intendedParent.attach(built);
                System.out.println("          attached immediately to container");
            } else {
                System.out.println("          NOT attached yet -- caller will attach it later");
            }
            return built;
        }
    }

    public static void main(String[] args) {
        Environment darkTheme = new Environment("dark");
        Container screen = new Container();

        Widget first = Inflater.from(darkTheme).inflate("row-layout", screen, false);
        Widget second = Inflater.from(darkTheme).inflate("row-layout", screen, false);

        System.out.println();
        System.out.println("inflateCallCount        = " + inflateCallCount);
        System.out.println("screen.children.size()  = " + screen.children.size());
        System.out.println("first  = " + first);
        System.out.println("second = " + second);
    }
}
