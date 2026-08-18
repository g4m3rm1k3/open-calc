#include <iostream>

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
};

int main() {
    // Build the path for "to" by hand: root -> 't' -> 'o', no insert() yet.
    TrieNode* root = new TrieNode();
    root->children[static_cast<unsigned char>('t')] = new TrieNode();
    TrieNode* afterT = root->children[static_cast<unsigned char>('t')];
    afterT->children[static_cast<unsigned char>('o')] = new TrieNode();
    TrieNode* afterTo = afterT->children[static_cast<unsigned char>('o')];
    afterTo->isEnd = true;

    std::cout << "root->children['t'] is "
              << (root->children[static_cast<unsigned char>('t')] != nullptr ? "set" : "nullptr")
              << std::endl;
    std::cout << "root->children['t']->children['o'] is "
              << (afterT->children[static_cast<unsigned char>('o')] != nullptr ? "set" : "nullptr")
              << std::endl;
    std::cout << "root->children['t']->children['o']->isEnd = " << afterTo->isEnd << std::endl;

    std::cout << "\nWalking a path that was never built:" << std::endl;
    std::cout << "root->children['x'] is "
              << (root->children[static_cast<unsigned char>('x')] != nullptr ? "set" : "nullptr")
              << std::endl;

    std::cout << "\nWalking a path that exists structurally but was never marked complete:" << std::endl;
    std::cout << "root->children['t']->isEnd = " << afterT->isEnd
              << " (the path to 't' exists, but \"t\" alone was never inserted as a word)" << std::endl;

    return 0;
}
