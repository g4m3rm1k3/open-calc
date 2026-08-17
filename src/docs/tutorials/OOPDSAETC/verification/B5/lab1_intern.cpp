#include <iostream>
#include <string>
#include <vector>

class TagPool {
public:
    const std::string* intern(const std::string& text) {
        for (std::string* existing : pool) {
            if (*existing == text) {
                return existing;
            }
        }
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
    const std::string* c = pool.intern("imported");

    std::cout << "a == b: " << (a == b) << std::endl;
    std::cout << "a == c: " << (a == c) << std::endl;
    std::cout << "a address: " << a << ", b address: " << b << std::endl;

    return 0;
}
