#include <iostream>
#include <string>

struct Link {
    std::string label;
    Link* next;
};

int main() {
    Link second{"second", nullptr};
    Link first{"first", &second};

    std::cout << first.label << " -> " << first.next->label << std::endl;
    return 0;
}
