// Adds validation message within parentDiv
function validationMessage(message, parentDiv) {
    // Add validation message
    const warningMessage = document.createElement('p');
    warningMessage.innerhtml = message;
    warningMessage.className = 'text-danger';

    // Add validation message to DOM
    document.getElementById(parentDiv).append(warningMessage);
}


function clearEdit(postID) {
    // Removes textarea, save button and cancel button
    document.getElementById(`textarea_${postID}`).remove()
    document.getElementById(`save_${postID}`).remove()
    document.getElementById(`cancel_${postID}`).remove()

    // Add content of the post, edit button and no of likes to the DOM
    document.getElementById(`post_content_${postID}`).style.display = 'block';
    document.getElementById(`edit_${postID}`).style.display = 'inline-block';
    document.getElementById(`post_likes_${postID}`).style.display = 'block';
}


function updateLikes(id, likes) {
    let likecounter = document.getElementById(`post_likecount_${id}`);

    likecounter.innerHTML = likes;
}

// event listener
document.addEventListener("DOMContentLoaded", contentloaded());
// when the dom content is loaded...do the following
function contentloaded() {
    
    // Add event listener that listens for any clicks on the page
    document.addEventListener('click', event => {

        // Save the element the user clicked on
        const htmlelement = event.target;


        // If the user clicks the edit button
        if (htmlelement.id.startsWith('edit_')) {

            // Save necessary variables
            const editButton = htmlelement;
            const postID = editButton.dataset.id;
            const postText = document.getElementById(`post_content_${postID}`);

            // Adding a prepopulated textarea element for editing the post
            let textarea = document.createElement('textarea');
            textarea.innerHTML = postText.innerHTML;
            textarea.id = `textarea_${postID}`;
            textarea.className = 'form-control';
            document.getElementById(`post_contentgroup_${postID}`).append(textarea);

            // removes the postText element which is the post for editing
            postText.style.display = 'none';

            // Hides likes
            document.getElementById(`post_likes_${postID}`).style.display = 'none';

            // Removes the edit button
            editButton.style.display = 'none';

            // Adding 'Cancel' button
            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = 'Cancel';
            cancelButton.className = 'btn btn-danger cancel-badge badge ml-1 text-right btn-sm';
            cancelButton.id = `cancel_${postID}`;

            // Adding "save" button
            const saveButton = document.createElement('button');
            saveButton.innerHTML = 'Save';
            saveButton.className = 'btn btn btn-primary btn-sm mt-2 px-2';
            saveButton.id = `save_${postID}`

            // Add save button to DOM
            document.getElementById(`save_buttons_${postID}`).append(saveButton);

            // Add cancel button to DOM
            document.getElementById(`post_headline_${postID}`).append(cancelButton);
            
            // An event listener for when user clicks cancel button
            cancelButton.addEventListener('click', function() {
                clearEdit(postID);
            })

            // fetch request when the user clicks save button
            saveButton.addEventListener('click', function() {
                textarea = document.getElementById(`textarea_${postID}`);

                // Make a fetch request to update page without reloadin it
                fetch(`/editpost/${postID}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        // Pass in the new content typed in the text area
                        content: textarea.value
                    })
                })

                .then(response => {
                    if (response.status == 400 || response.ok) {
                        return response.json()
                    // Throws error for users who aren't authorised
                    } else if (response.status === 404) {
                        clearEdit(postID);

                        // Hide edit button to prevent happening again
                        editButton.style.display = 'none';

                        // creates validation message
                        validationMessage("You are not authorised to do this", `post_contentgroup_${postID}`)

                        // Rejects promise and throws error
                        return Promise.reject('Error 404')
                    } else {
                        return Promise.reject('There has been an error' + response.status)
                    }
                })

                .then(result => {
                    
                    // result must be successful
                    if (!result.error) {

                        // Sets on screen text to what the user edited
                        postText.innerHTML = result.content

                        // Removes all edit fields and restores to normal view
                        clearEdit(postID);
                    } else {
                        clearEdit(postID);

                        // Hides edit button to prevent happening agin
                        editButton.style.display = 'none';

                        validationMessage(result.error, `post_contentgroup_${postID}`)
                    }
                })

                .catch(error => {
                    console.error(error);
                })
            })
        }



        // check if the user clicked a like icon
        if (htmlelement.id.startsWith('post_likeicon_')) {

            // Save post ID from data in element
            let id = htmlelement.dataset.id;

            // Make fetch request to update page without full reload
            fetch(`/updateLike/${post_id}`, {
                method: 'POST'
            })
            .then(function(response) {
                if (response.ok) {
                    return response.json()
                }
                // if response is an error, reject promise
                else {
                    return Promise.reject('There has been an error!')
                }
            })
            .then(function(data) {

                // saving data from response
                const postLikes = data.postLikes;
                const likes = data.likesCount;

                // Like icon 
                let likeIcon = document.getElementById(`post_likeicon_${id}`);

                // call the updateLikes function to update no of likes on page 
                updateLikes(id, likes);

                // Updates like icon 
                if (postLikes) {
                    likeIcon.className = 'likeicon fa-heart fas';
                } else {
                    likeIcon.className = 'likeicon fa-heart far';
                }
            })
        }
    })
}