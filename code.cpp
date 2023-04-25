#include <iostream>
#include <cstdio>
using namespace std;

int main(int argc, char *argv[])
{
    freopen(argv[1],"r",stdin);
    int a,b;
    cin >> a >> b;
    int sum = a+b;
    cout << sum << "\n";
    return 0;
}
