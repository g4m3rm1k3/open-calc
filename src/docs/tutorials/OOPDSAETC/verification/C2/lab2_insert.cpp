#include <iostream>
#include <string>

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    int value = 0;
};

void insertWord(TrieNode* root, const std::string& word, int value) {
    TrieNode* current = root;
    for (char c : word) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            std::cout << "  no child for '" << c << "' yet -> creating a new TrieNode" << std::endl;
            current->children[index] = new TrieNode();
        } else {
            std::cout << "  child for '" << c << "' already exists -> reusing it" << std::endl;
        }
        current = current->children[index];
    }
    current->isEnd = true;
    current->value = value;
}

int main() {
    TrieNode* root = new TrieNode();

    std::cout << "insertWord(\"to\", 1):" << std::endl;
    insertWord(root, "to", 1);

    std::cout << "\ninsertWord(\"ten\", 2):" << std::endl;
    insertWord(root, "ten", 2);

    std::cout << "\ninsertWord(\"tea\", 3):" << std::endl;
    insertWord(root, "tea", 3);

    // Manually walk the same path lab1 built by hand, this time built by insertWord.
    TrieNode* afterT = root->children[static_cast<unsigned char>('t')];
    TrieNode* afterTo = afterT->children[static_cast<unsigned char>('o')];
    std::cout << "\nroot->children['t']->children['o']->isEnd = " << afterTo->isEnd
              << ", value = " << afterTo->value << std::endl;

    TrieNode* afterTe = afterT->children[static_cast<unsigned char>('e')];
    std::cout << "root->children['t']->children['e']->isEnd = " << afterTe->isEnd
              << " (\"te\" was never inserted on its own)" << std::endl;

    return 0;
}
