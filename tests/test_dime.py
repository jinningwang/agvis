from dime import DimeClient

def test_dime():
    d1 = DimeClient("ipc", "/tmp/dime.sock");
    d2 = DimeClient("ipc", "/tmp/dime.sock");
    d3 = DimeClient("ipc", "/tmp/dime.sock");

    d1.join("turtle", "lizard")
    d2.join("crocodile")
    d3.join("dragon", "wyvern")

    assert print(d1.devices()) == ['crocodile', 'dragon', 'lizard', 'turtle', 'wyvern']