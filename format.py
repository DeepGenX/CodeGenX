s = """
def absolute_value(num):
    if num >= 0:
        return num
    else:
        return -num


print(absolute_value(2))

print(absolute_value(-4))

def gay(num):
    if num >= 0:
        return num
    else:
        return -num

class Bruh:
    def __init__():
        self.gay = 69
    def bruh():
        print("Gay")

b = Bruh()
print(b)
"""

splitted = s.replace("    ", "\t").split("\n")

result = []
temp = ""
scope = False
for element in splitted:
    if element.startswith("def") or element.startswith("class"):
        if temp != "":
            result.append(temp)
            temp = ""
        temp += element
        temp += "\n"
        scope = True
        continue
    if scope:
        if element.startswith("\t"):
            temp += element
            temp += "\n"
        else:
            scope = False
            result.append(temp)
            temp = ""
        continue
    temp += element
    if element != "":
        temp += "\n"

if temp != "":
    result.append(temp)
    temp = ""

