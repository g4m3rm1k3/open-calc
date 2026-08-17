#include <iostream>
#include <stack>

int main() {
    std::stack<int> pending;
    pending.push(10);
    pending.push(20);
    pending.push(30);

    std::cout << "top is: " << pending.top() << std::endl;

    while (!pending.empty()) {
        std::cout << "popped: " << pending.top() << std::endl;
        pending.pop();
    }

    return 0;
}
