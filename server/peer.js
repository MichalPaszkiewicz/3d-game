// peer.js
// ==========
module.exports = {
    Peer: function (ID, ws) {

        var self = {
            ID: ID,
            ws: ws
        };

        return self;
    },
    Peers: function () {
        
        var self = {
            items: [],
            add: function(ID, ws){
                self.items.push(new module.exports.Peer(ID, ws));
            },
            remove: function (ID) {
                var Index = null;
                for (var i = 0; i < self.items.length; i++) {
                    if (self.items[i].ID == ID) {
                        Index = i;
                    }
                }

                if (Index != null) {
                    self.items.splice(Index, 1);
                    return;
                }
            },
            getOthers: function (ID) {
                var result = [];
                for (var i = 0; i < self.items.length; i++) {
                    if (self.items[i].ID != ID) {
                        result.push(self.items[i]);
                    }
                }

                return result;
            },
            getParticular: function (ID) {
                for (var i = 0; i < self.items; i++) {
                    if (self.items[i].ID == ID) {
                        return self.items[i];
                    }
                }
            }
        };

        return self;
    }
}