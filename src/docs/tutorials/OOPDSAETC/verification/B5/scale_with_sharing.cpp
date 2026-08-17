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

struct TaggedRecord {
    const std::string* tag;
};

int main() {
    TagPool pool;
    std::vector<TaggedRecord*> records;
    const char* tags[] = {"perishable", "imported", "on-sale", "fragile", "seasonal"};

    for (int i = 0; i < 2000000; i++) {
        records.push_back(new TaggedRecord{pool.intern(tags[i % 5])});
    }

    std::cout << "built " << records.size() << " records" << std::endl;
    return 0;
}
