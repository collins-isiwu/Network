document.addEventListener("DOMContentLoaded", contentloaded());

function contentloaded() {
    
    // Add event listener that listens for any clicks on the page
    document.addEventListener('click', event => {

        // Save the element the user clicked on
        const htmlelement = event.target;

        // check if the user clicked a like icon
        if (Element.id.startsWith('post_likeicon_'))
    })
}