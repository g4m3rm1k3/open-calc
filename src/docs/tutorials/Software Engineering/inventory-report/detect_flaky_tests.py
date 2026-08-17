import subprocess
import sys

def rerun(check_path, times):
    passed = 0
    failed = 0
    for _ in range(times):
        result = subprocess.run(["python3", check_path], capture_output=True, text=True)
        if result.returncode == 0:
            passed += 1
        else:
            failed += 1
    return passed, failed

def main():
    check_path = sys.argv[1]
    times = int(sys.argv[2])
    passed, failed = rerun(check_path, times)
    print(check_path + ": " + str(passed) + " passed, " + str(failed) + " failed, out of " + str(times) + " runs")

if __name__ == "__main__":
    main()
