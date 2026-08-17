#include <iostream>
#include <string>
#include <vector>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

struct Entry {
    std::string key;
    int value;
};

int main() {
    size_t capacity = 4;
    std::vector<std::vector<Entry>> buckets(capacity);

    std::vector<std::pair<std::string, int>> toInsert = {
        {"Apple", 12}, {"Banana", 7}, {"Cheese", 3}
    };

    for (auto& [key, value] : toInsert) {
        size_t idx = djb2(key) % capacity;
        buckets[idx].push_back({key, value});
        std::cout << "insert(\"" << key << "\", " << value << ") -> bucket " << idx
                  << " (bucket " << idx << " now holds " << buckets[idx].size() << " entr"
                  << (buckets[idx].size() == 1 ? "y" : "ies") << ")" << std::endl;
    }

    std::cout << "\nFull bucket layout:" << std::endl;
    for (size_t i = 0; i < capacity; ++i) {
        std::cout << "bucket " << i << ": [";
        for (size_t j = 0; j < buckets[i].size(); ++j) {
            std::cout << buckets[i][j].key << "=" << buckets[i][j].value;
            if (j + 1 < buckets[i].size()) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }

    std::cout << "\nLooking up \"Cheese\" by walking bucket " << (djb2("Cheese") % capacity) << ":" << std::endl;
    size_t idx = djb2("Cheese") % capacity;
    for (auto& e : buckets[idx]) {
        std::cout << "  checking \"" << e.key << "\" == \"Cheese\"? "
                  << (e.key == "Cheese" ? "yes, found it" : "no, keep walking") << std::endl;
        if (e.key == "Cheese") break;
    }

    return 0;
}
