/**
 *
 * @param SelectedElement
 * @param SubtypeAttributeToStopAt
 * @returns {Promise<any>}
 */
export async function retrieveLoci (SelectedElement, SubtypeAttributeToStopAt) {
    return new Promise((resolve, reject) => {
        let ArrayOfLoci = [];



        /**
         *
         * @param Element
         * @returns {boolean}
         */
        function isNotHighestSubsection (Element) {
            if (Element.getAttribute('subtype') !== SubtypeAttributeToStopAt) {
                return true;
            }
        }



        /**
         * Recursive function
         * @param Element
         */
        function appendNAttribute (Element) {
            if (Element.hasAttribute('n')) {
                ArrayOfLoci.unshift(Element.getAttribute('n'));
                if (Element.parentNode && isNotHighestSubsection(Element)) {
                    appendNAttribute(Element.parentNode)
                }
            }
            else {
                if (Element.parentNode && isNotHighestSubsection(Element)) {
                    appendNAttribute(Element.parentNode)
                }
            }
        }



        appendNAttribute(SelectedElement);
        resolve(ArrayOfLoci);
    });
}



/**
 * Moves an object within an array
 * @param array
 * @param element
 * @param delta
 */
export function moveInArray (array, element, delta) {
    let index = array.indexOf(element);
    let newIndex = index + delta;
    if (newIndex < 0 || newIndex == array.length) return; //Already at the top or bottom.
    let indexes = [index, newIndex].sort(); //Sort the indixes
    array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
};




