#include <iostream>
#include <string>
#include <vector>

class TagPool {
public:
    const std::string* intern(const std::string& text) {
        // bug: forgot to search the existing pool first -- always allocates fresh
        std::string* fresh = new std::string(text);
        pool.push_back(fresh);
        return fresh;
    }

private:
    std::vector<std::string*> pool;
};

int main() {
    TagPool pool;

    const std::string* a = pool.intern("perishable");
    const std::string* b = pool.intern("perishable");

    std::cout << "*a: " << *a << ", *b: " << *b << std::endl;
    std::cout << "a == b: " << (a == b) << std::endl;

    return 0;
}
