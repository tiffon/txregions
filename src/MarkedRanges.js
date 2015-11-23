
class LinkedListItem {
    constructor(value, next) {
        this.value = value;
        this.next = next;
    }
}


class MarkedIndex {
    constructor(index, classes) {
        this.index = index || 0;
        this.classes = classes || [];
    }
}


class MarkedRange {
    constructor(start, end, classes) {
        this.start = start;
        this.end = end;
        this.classes = classes;
    }
}


export default class MarkedRanges {
    constructor() {
        this.list = undefined;
    }

    markRange(startIndex, endIndex, className) {
        var item = this.list,
            prev,
            mi,
            classes,
            newItem;
        if (!item) {
            // first mark for the text
            mi = new MarkedIndex(startIndex, [className]);
            this.list = new LinkedListItem(mi);
            mi = new MarkedIndex(endIndex);
            this.list.next = new LinkedListItem(mi);
            return;
        }
        while (item && item.value.index < startIndex) {
            prev = item;
            item = item.next;
        }
        if (item && item.value.index === startIndex) {
            item.value.classes.push(className);
            prev = item;
            item = item.next;
        } else {
            if (prev) {
                classes = prev.value.classes.slice();
                classes.push(className);
            } else {
                classes = [className];
            }
            mi = new MarkedIndex(startIndex, classes);
            newItem = new LinkedListItem(mi, item);
            if (prev) {
                prev.next = newItem;
            } else {
                // have a new head of the list
                this.list = newItem;
            }
            prev = newItem;
            newItem = undefined;
        }
        while (item && item.value.index < endIndex) {
            item.value.classes.push(className);
            prev = item;
            item = item.next;
        }
        if (item && item.value.index === endIndex) {
            return;
        }
        if (prev) {
            // base the classes that are valid at startIndex on
            // the prev classes
            classes = prev.value.classes.slice();
            // get rid of the `className` that was added to the end
            classes.pop();
        } else {
            classes = [];
        }
        mi = new MarkedIndex(endIndex, classes);
        newItem = new LinkedListItem(mi, item);
        if (prev) {
            prev.next = newItem;
        }
    }

    getRanges() {
        var ranges = [],
            item = this.list,
            start,
            end,
            classes;
        if (!item) {
            return ranges;
        }
        // can skip creating a range off the last index bc it's just
        // a stop - it has an empty classes array and doesn't need
        // a range
        while (item.next) {
            classes = item.value.classes;
            if (!classes.length) {
                item = item.next;
                continue;
            }
            start = item.value.index;
            end = item.next.value.index;
            item = item.next;
            ranges.push(new MarkedRange(start, end, classes));
        }
        return ranges;
    }

    reset() {
        this.list = undefined;
    }
}
