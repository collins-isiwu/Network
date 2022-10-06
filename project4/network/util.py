def get_previous_url(page_obj):
    if page_obj.has_previous():
        previous_url = f'?page={page_obj.previous_page_number()}'
    else:
        previous_url = ''
    return previous_url


def get_next_url(page_obj):
    if page_obj.has_next():
        next_url = f"?page={page_obj.next_page_number()}"
    else:
        next_url = ''
    return next_url