const C_i = Components.interfaces;

function voidFunc() {
  // do nothing
}
function returnFalse() {
  return false;
}

/**
 * Create a TreeRow associated with a given object.
 *
 * @param aObject    The raw object to bind to.
 * @param aTreeView  The nsITreeView that owns this row.
 * @param aParentRow A parent row for this one, if there is one.
 */
function TreeRow(aObject, aTreeView, aParentRow) {
  this._object = aObject;
  this._treeView = aTreeView;
  this.parentRow = aParentRow;

  // The number of ancestors, plus one, to the tree root.
  this.level = !aParentRow ? 0 : aParentRow.level + 1;

  // A list of child rows we've cached.
  this._childRows = [];

  this._askedForChildRows = false;

  // Every tree row starts as closed.  See ClassTreeView::toggleOpenObject().
  this.isContainerOpen = false;
}
TreeRow.prototype = {
  /**
   * Does this row have any child rows?
   */
  get isContainer() {
    return this._childRows.length > 0;
  },

  /**
   * Presumed false, since this shouldn't get called except if this.isContainer.
   */
  get isContainerEmpty() {
    return false;
  },

  /**
   * Does this row have a sibling after it?
   */
  get hasNextSibling() {
    var siblings = this._treeView.getSiblings(this);
    if (siblings.length == 0) return false;
    return siblings[siblings.length - 1] != this;
  },

  /**
   * Store a child row for a child object of our own object.
   *
   * @param aChild The child object to store a row for.
   */
  addChildObject: function addChildObject(aChild) {
    var row = new TreeRow(aChild, this._treeView, this);
    this._childRows.push(row);
  },

  toString: function toString() {
    return "[object TreeRow (" + this._object + ")]";
  }
};

/**
 * Provide an object to get a cell's value for its row and column.
 *
 * @param aColumn The column of the tree to bind the cell to.
 *
 * @note The column may have a propertyname attribute on it, which defines a
 *       direct property of the current object, or it may have a function as its
 *       cellGetter user data.  In the latter case, the function will receive
 *       the object as its first argument, and should return the desired
 *       property.
 */
function CellGetter(aColumn) {
  this._propertyName = aColumn.element.getAttribute("propertyname");
  if (!this._propertyName)
  {
    this.getLabel = aColumn.element.getUserData("cellGetter");
    if ((typeof this.getLabel != "function") ||
        (this.getLabel.arity != 1))
    {
      this.getLabel = function getNullLabel() {
        return "";
      };
    }
  }
}
CellGetter.prototype = {
  /**
   * Get the label for a cell, based on a propertyname attribute for the column.
   *
   * @param aRow The row to get a label for.
   *
   * @returns String label for the property.
   */
  getLabel: function getLabel(aRow) {
    return aRow._object[this._propertyName];
  }
};

/**
 * Define a tree view for a XUL tree, based on a hierarchy of objects.
 *
 * @param aChildGetter A JS function that returns a list of child objects for any given object.
 */
function ClassTreeView(aChildGetter) {
  this._topLevelRows = [];
  this._rows = [];
  this._cellGetters = [];
  this._hasSetTree = false;

  this._childGetter = aChildGetter;

  // nsITreeView
  this.selection = null;
}
ClassTreeView.prototype = {
  /**
   * Internal method for adding child rows to a parent row.
   *
   * @param aRow TreeRow object to find and add children for.
   */
  _addChildrenRows: function _addChildrenRows(aRow) {
    if (aRow._askedForChildRows)
      return;
    var childObjects = this._childGetter(aRow._object);
    aRow._childRows = [];
    for each (var kid in childObjects)
      aRow.addChildObject(kid);
    aRow._askedForChildRows = true;
  },

  /**
   * Add a top-level object to the tree.
   *
   * @param aObject The object to add.
   * @param aOpen   Boolean, true if the object's row should be open.
   */
  addTopObject: function addTopObject(aObject, aOpen) {
    var row = new TreeRow(aObject, this, null);
    row.isContainerOpen = Boolean(aOpen);
    this._topLevelRows.push(row);
    this._rows.push(row);

    this._addChildrenRows(row);
  },

  /**
   * Get a TreeRow based on its index.
   *
   * @param aIndex The index of the row to get.
   *
   * @returns The TreeRow.
   */
  getRow: function getRow(aIndex) {
    return this._rows[aIndex];
  },

  /**
   * Get a TreeRow based on the object associated with it.
   *
   * @param aObject The object to find a row for.
   *
   * @returns The TreeRow.
   */
  getRowForObject: function getRowForObject(aObject) {
    for each (var row in this._rows)
    {
      if (row._object == aObject)
        return row;
    }
    return null;
  },

  /**
   * Get the object associated with a TreeRow.
   *
   * @param The TreeRow to get the object from.
   *
   * @returns The object.
   */
  getObjectForRow: function getObjectForRow(aRow) {
    return aRow._object;
  },

  getObjectForIndex: function getObjectForIndex(aIndex) {
    return this.getObjectForRow(this.getRow(aIndex));
  },

  /**
   * Get all the rows which are direct children of a row's parent.
   *
   * @param aRow The TreeRow.
   *
   * @returns A JS array of TreeRow objects.
   */
  getSiblings: function getSiblings(aRow) {
    if (!aRow.parentRow)
      return this._topLevelRows;
    return aRow.parentRow._childRows;
  },

  /**
   * Toggle whether the row for an object is open or not.
   *
   * @param aObject The object to open or close a row for.
   */
  toggleOpenObject: function toggleOpenObject(aObject) {
    var row = this.getRowForObject(aObject);
    if (!row)
      return;
    var index = this._rows.indexOf(row);
    if (index == -1)
      return;
    this.toggleOpenState(index);
  },

  // nsITreeView
  get rowCount() {
    return this._rows.length;
  },

  getRowProperties: voidFunc,
  getCellProperties: voidFunc,
  getColumnProperties: voidFunc,

  isContainer: function isContainer(aIndex) {
    var row = this.getRow(aIndex);
    return row.isContainer;
  },
  isContainerOpen: function isContainerOpen(aIndex) {
    var row = this.getRow(aIndex);
    return row.isContainerOpen;
  },
  isContainerEmpty: function isContainerEmpty(aIndex) {
    var row = this.getRow(aIndex);
    return row.isContainerEmpty;
  },

  isSeparator: returnFalse,
  isSorted: returnFalse,
  canDrop: returnFalse,
  drop: voidFunc,

  getParentIndex: function getParentIndex(aIndex) {
    var row = this.getRow(aIndex).parentRow;
    if (!row) return -1;
    return this._rows.indexOf(row);
  },
  hasNextSibling: function hasNextSibling(aIndex, aAfter)
  {
    var row = this.getRow(aIndex);
    return row.hasNextSibling;
  },
  getLevel: function getLevel(aIndex) {
    var row = this.getRow(aIndex);
    return row.level;
  },
  getImageSrc: voidFunc,
  getProgressMode: voidFunc,
  getCellValue: voidFunc,

  getCellText: function getCellText(aIndex, aColumn) {
    var row = this.getRow(aIndex);
    return this._cellGetters[aColumn.index].getLabel(row);
  },
    
  setTree: function(treeBox) {
    if (!this._hasSetTree)
    {
      for (var i = 0; i < this._rows.length; i++)
      {
        if (this._rows[i].isContainerOpen) {
          this._rows[i].isContainerOpen = false;
          this.toggleOpenState(i);
        }
      }
      this._hasSetTree = true;
    }

    this.treeBox = treeBox;

    this._cellGetters = [];
    if (!treeBox)
      return;
    var column = treeBox.columns.getFirstColumn();
    while (column) {
      this._cellGetters.push(new CellGetter(column));
      column = column.getNext();
    }
  },

  toggleOpenState: function toggleOpenState(aIndex) {
    var row = this.getRow(aIndex);

    var changeCount = 0;
    var shouldAddChildren = false;
    if (row.isContainerOpen) {
      row.isContainerOpen = false;

      var thisLevel = row.level;
      var deletecount = 0;
      for (var t = aIndex + 1; t < this._rows.length; t++) {
        if (this.getLevel(t) > thisLevel) deletecount++;
        else break;
      }
      if (deletecount) {
        this._rows.splice(aIndex + 1, deletecount);
        changeCount = -deletecount;
      }
    }
    else {
      row.isContainerOpen = true;
      shouldAddChildren = true;
      var childRows = row._childRows;
      for (var i = 0; i < childRows.length; i++) {
        this._rows.splice(aIndex + i + 1, 0, childRows[i]);
      }
      changeCount = childRows.length;
    }

    if (this.treeBox)
      this.treeBox.rowCountChanged(aIndex + 1, changeCount);
    if (shouldAddChildren) {
      for (let i = 0; i < childRows.length; i++) {
        this._addChildrenRows(childRows[i]);
      }
    }
  },

  cycleHeader: voidFunc,
  selectionChanged: voidFunc,
  cycleCell: voidFunc,
  isEditable: returnFalse,
  isSelectable: returnFalse,
  setCellValue: voidFunc,
  setCellText: voidFunc,

  // These are dead functions.
  performAction: voidFunc,
  performActionOnRow: voidFunc,
  performActionOnCell: voidFunc,

  // Diagnostic.
  toString: function toString() {
    var msg = "";
    var indentStr = "";
    function indent() {
      indentStr += "  ";
    }
    function outdent() {
      indentStr = indentStr.substr(2);
    }
    function addLine(aLine) {
      msg += (indentStr + aLine + "\n");
    }

    addLine("{"); indent(); // begin toString()
    addLine("_rows: ["); indent(); // begin _rows

    var count = this.rowCount;
    var colCount = this._cellGetters.length;
    for (var i = 0; i < count; i++) {
      addLine("{"); indent(); // begin individual row
      addLine("rowIndex: " + i + ",");
      addLine("parentIndex: " + this.getParentIndex(i) + ",");
      addLine("level: " + this.getLevel(i) + ",");
      addLine("isContainer: " + this.isContainer(i) + ",");
      addLine("isContainerOpen: " + this.isContainerOpen(i) + ",");
      addLine("isContainerEmpty: " + this.isContainerEmpty(i) + ",");

      addLine("_cells: ["); indent(); // begin cells;
      for (var j = 0; j < colCount; j++) {
        var cellValue = "'" + this.getCellText(i, {index: j}) + "'";
        if (j < colCount - 1)
          cellValue += ",";
        addLine(cellValue);
      }
      outdent(); addLine("],"); // end _cells

      addLine("hasNextSibling: " + this.hasNextSibling(i, 0));

      outdent();
      var endChar = "}";
      if (i < count - 1)
        endChar += ","
      addLine(endChar); // end individual row
    }
    
    outdent(); addLine("]"); // end _rows
    outdent(); addLine("}"); // end toString();

    return msg;
  },

  // nsISupports
  QueryInterface: function QueryInterface(aIID) {
    if (aIID.equals(C_i.nsITreeView) ||
        aIID.equals(C_i.nsISupports))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

const EXPORTED_SYMBOLS = ["ClassTreeView"];