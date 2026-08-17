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

void printLayout(const std::vector<std::vector<Entry>>& buckets) {
    for (size_t i = 0; i < buckets.size(); ++i) {
        std::cout << "  bucket " << i << ": [";
        for (size_t j = 0; j < buckets[i].size(); ++j) {
            std::cout << buckets[i][j].key;
            if (j + 1 < buckets[i].size()) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }
}

void rehash(std::vector<std::vector<Entry>>& buckets) {
    size_t oldCapacity = buckets.size();
    size_t newCapacity = oldCapacity * 2;
    std::cout << "  load factor threshold crossed -> rehashing: capacity " << oldCapacity
              << " -> " << newCapacity << std::endl;

    std::vector<std::vector<Entry>> old = std::move(buckets);
    buckets.assign(newCapacity, {});
    for (auto& bucket : old) {
        for (auto& e : bucket) {
            size_t newIdx = djb2(e.key) % newCapacity;
            std::cout << "    re-placing \"" << e.key << "\" -> bucket " << newIdx
                      << " (was in a bucket sized for capacity " << oldCapacity << ")" << std::endl;
            buckets[newIdx].push_back(std::move(e));
        }
    }
}

void insert(std::vector<std::vector<Entry>>& buckets, size_t& count, const std::string& key, int value) {
    double loadFactorAfter = static_cast<double>(count + 1) / buckets.size();
    std::cout << "insert(\"" << key << "\"): count=" << count << ", capacity=" << buckets.size()
              << ", load factor after insert would be " << loadFactorAfter << std::endl;
    if (loadFactorAfter > 0.75) {
        rehash(buckets);
    }
    size_t idx = djb2(key) % buckets.size();
    buckets[idx].push_back({key, value});
    ++count;
    std::cout << "  placed in bucket " << idx << " (capacity is now " << buckets.size() << ")" << std::endl;
}

int main() {
    size_t capacity = 4;
    std::vector<std::vector<Entry>> buckets(capacity);
    size_t count = 0;

    std::cout << "Reference: hash % 4 and hash % 8 for each key\n";
    for (const std::string& key : {"Apple", "Banana", "Cheese", "Bread"}) {
        std::cout << "  " << key << ": %4=" << djb2(key) % 4 << "  %8=" << djb2(key) % 8 << std::endl;
    }
    std::cout << std::endl;

    insert(buckets, count, "Apple", 12);
    insert(buckets, count, "Banana", 7);
    insert(buckets, count, "Cheese", 3);
    insert(buckets, count, "Bread", 9);

    std::cout << "\nFinal layout (capacity " << buckets.size() << "):" << std::endl;
    printLayout(buckets);

    return 0;
}
