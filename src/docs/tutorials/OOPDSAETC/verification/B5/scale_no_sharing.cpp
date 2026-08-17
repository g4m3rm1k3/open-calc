#include <iostream>
#include <string>
#include <vector>

struct TaggedRecord {
    std::string tag;
};

int main() {
    std::vector<TaggedRecord*> records;
    const char* tags[] = {"perishable", "imported", "on-sale", "fragile", "seasonal"};

    for (int i = 0; i < 2000000; i++) {
        records.push_back(new TaggedRecord{std::string(tags[i % 5])});
    }

    std::cout << "built " << records.size() << " records" << std::endl;
    return 0;
}
