let s = `
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
`

let s2 = `
def sigmoid_f(x):
    return 1.0 / (1.0 + np.exp(-x))

@tf.function
def train_step(X, y, epsilon=1e-3, lr=0.001):
    # Compute the loss
    loss = -tf.reduce_sum(y * tf.log(y_hat + epsilon) + (1 - y) *
                          (1 - y_hat + epsilon))
    # Compute the gradients
    gradients = tf.gradients(loss, train_network.weights)
    train_network.update_weights(gradients)

    # Optimize
    train_network.update_learning_rate(lr)
    train_network.update_weights(train_network.weights)
    train_network.update_learning_rate(0.001)

    # Return loss
    return loss

# Define the variables
network_variable_1 = tf.get_variable('network', [784, 10])
network_variable_2 = tf.get_variable('network', [10, 10])
network_variable_3 = tf.get_variable('network', [10, 10])
network_variable_4 = tf.get_variable('network', [10, 10])

# Define the model
net = tf.nn.relu(tf.matmul(X, network_variable_1) +
                     tf.matmul(X, network_variable_2) +
                     tf.matmul(X, network_variable_3) +
                     tf.matmul(X, network_variable_
`

let s3 = `
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def train(X, y, n_epochs=100):
    for epoch in range(n_epochs):
        model.train(X, y)
        print('Epoch', epoch, 'completed out of', n_epochs, '(', model.loss, ')')

if __name__ == '__main__':
    X = np.loadtxt('Data
`


var splitted = s3.replace(/    /g, "\t").split("\n");
var new_splitted = [];
for(const element of splitted) {
    if(element != "") {
        new_splitted.push(element)
    }
}
var result = [];
var temp = "";
var scope = false;
var comment_scope = false;
console.log(new_splitted);
for (const element of new_splitted) {
    if(!scope && !comment_scope) {
        if (element.startsWith("def") || element.startsWith("class")) {
            if (temp != "" && !element.startsWith("@")) {
                result.push(temp);
                temp = "";
            }
            temp += element;
            temp += "\n";
            scope = true;
            continue;
        } else if(element.startsWith("#")) {
            if (temp != "") {
                result.push(temp);
                temp = "";
            }
            temp += element;
            temp += "\n";
            comment_scope = true;
            continue
        }
    }
    if (scope) {
        if (element.startsWith("\t")) {
            temp += element;
            temp += "\n";
            continue
        } else if(element.startsWith("def") || element.startsWith("class") || element.startsWith("@")) {
            if (temp.startsWith("@")) {
                temp += element;
                temp += "\n";
                continue
            }
            result.push(temp);
            temp = element;
            temp += "\n";
            continue
        } else {
            scope = false;
            result.push(temp);
            temp = element;
            temp += "\n";
            continue
        }
    } else if(comment_scope) {
        if(element.startsWith("def") || element.startsWith("class") || element.startsWith("@") || element.startsWith("#")) {
            comment_scope = false;
            result.push(temp);
            temp = element;
            temp += "\n";
            continue
        } else {
            temp += element;
            temp += "\n";
            continue
        }
    }
    temp += element;
    temp += "\n"
}
if(temp != "") {
    result.push(temp)
}

console.log(result);