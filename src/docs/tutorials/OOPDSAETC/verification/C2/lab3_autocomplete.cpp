#include <iostream>
#include <string>
#include <vector>

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    std::string word;
};

void insertWord(TrieNode* root, const std::string& word) {
    TrieNode* current = root;
    for (char c : word) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            current->children[index] = new TrieNode();
        }
        current = current->children[index];
    }
    current->isEnd = true;
    current->word = word;
}

void collect(TrieNode* node, std::vector<std::string>& matches) {
    if (node->isEnd) {
        matches.push_back(node->word);
    }
    for (int i = 0; i < 128; ++i) {
        if (node->children[i] != nullptr) {
            collect(node->children[i], matches);
        }
    }
}

std::vector<std::string> autocomplete(TrieNode* root, const std::string& prefix) {
    TrieNode* current = root;
    for (char c : prefix) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            return {};
        }
        current = current->children[index];
    }
    std::vector<std::string> matches;
    collect(current, matches);
    return matches;
}

void printMatches(const std::string& prefix, const std::vector<std::string>& matches) {
    std::cout << "autocomplete(\"" << prefix << "\") -> [";
    for (size_t i = 0; i < matches.size(); ++i) {
        std::cout << matches[i];
        if (i + 1 < matches.size()) std::cout << ", ";
    }
    std::cout << "]" << std::endl;
}

int main() {
    TrieNode* root = new TrieNode();
    insertWord(root, "in");
    insertWord(root, "inn");
    insertWord(root, "ink");

    printMatches("in", autocomplete(root, "in"));
    printMatches("inn", autocomplete(root, "inn"));
    printMatches("z", autocomplete(root, "z"));

    return 0;
}
