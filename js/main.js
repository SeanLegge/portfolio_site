(function ()
{
    "use strict";

    document.documentElement.classList.add("js");

    const SELECTOR_NAV = "#site-nav";
    const SELECTOR_NAV_TOGGLE = ".nav-toggle";
    const SELECTOR_REVEAL = ".reveal";
    const SELECTOR_FORM = "#contact-form";
    const CLASS_NAV_OPEN = "is-open";
    const CLASS_REVEALED = "is-visible";
    const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
    const REVEAL_THRESHOLD = 0.12;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const MESSAGE_REQUIRED = "This field is required.";
    const MESSAGE_EMAIL = "Enter a valid email address.";
    const LABEL_OPEN_MENU = "Open menu";
    const LABEL_CLOSE_MENU = "Close menu";

    const motion_query = window.matchMedia(MOTION_QUERY);

    function prefers_reduced_motion()
    {
        return motion_query.matches;
    }

    function init_nav()
    {
        const nav = document.querySelector(SELECTOR_NAV);
        const toggle = document.querySelector(SELECTOR_NAV_TOGGLE);

        if (!nav || !toggle)
        {
            return;
        }

        function set_open(is_open)
        {
            nav.classList.toggle(CLASS_NAV_OPEN, is_open);
            toggle.setAttribute("aria-expanded", String(is_open));
            toggle.setAttribute("aria-label", is_open ? LABEL_CLOSE_MENU : LABEL_OPEN_MENU);
        }

        toggle.addEventListener("click", function ()
        {
            const is_open = toggle.getAttribute("aria-expanded") !== "true";
            set_open(is_open);
        });

        nav.querySelectorAll("a").forEach(function (link)
        {
            link.addEventListener("click", function ()
            {
                set_open(false);
            });
        });

        document.addEventListener("keydown", function (event)
        {
            if (event.key === "Escape")
            {
                set_open(false);
            }
        });
    }

    function init_reveals()
    {
        const nodes = document.querySelectorAll(SELECTOR_REVEAL);

        if (!nodes.length)
        {
            return;
        }

        if (prefers_reduced_motion() || !("IntersectionObserver" in window))
        {
            nodes.forEach(function (node)
            {
                node.classList.add(CLASS_REVEALED);
            });
            return;
        }

        const observer = new IntersectionObserver(function (entries)
        {
            entries.forEach(function (entry)
            {
                if (entry.isIntersecting)
                {
                    entry.target.classList.add(CLASS_REVEALED);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: REVEAL_THRESHOLD
        });

        nodes.forEach(function (node)
        {
            observer.observe(node);
        });
    }

    function field_error(field, message)
    {
        const error_id = field.id + "-error";
        const error_node = document.getElementById(error_id);

        field.setAttribute("aria-invalid", message ? "true" : "false");

        if (message)
        {
            field.setAttribute("aria-describedby", error_id);
        }
        else
        {
            field.removeAttribute("aria-describedby");
        }

        if (error_node)
        {
            error_node.textContent = message;
        }
    }

    function validate_field(field)
    {
        const value = field.value.trim();

        if (field.required && !value)
        {
            field_error(field, MESSAGE_REQUIRED);
            return false;
        }

        if (field.type === "email" && value && !EMAIL_PATTERN.test(value))
        {
            field_error(field, MESSAGE_EMAIL);
            return false;
        }

        field_error(field, "");
        return true;
    }

    function init_form()
    {
        const form = document.querySelector(SELECTOR_FORM);

        if (!form)
        {
            return;
        }

        const fields = form.querySelectorAll("input:not([name='_gotcha']), textarea");
        const honeypot = form.querySelector("[name='_gotcha']");
        const status = document.getElementById("form-status");

        fields.forEach(function (field)
        {
            field.addEventListener("blur", function ()
            {
                validate_field(field);
            });
        });

        form.addEventListener("submit", function (event)
        {
            if (honeypot && honeypot.value)
            {
                event.preventDefault();
                return;
            }

            let is_valid = true;

            fields.forEach(function (field)
            {
                if (!validate_field(field))
                {
                    is_valid = false;
                }
            });

            if (!is_valid)
            {
                event.preventDefault();

                if (status)
                {
                    status.textContent = "Please correct the highlighted fields.";
                }

                const first_invalid = form.querySelector("[aria-invalid='true']");

                if (first_invalid)
                {
                    first_invalid.focus();
                }
            }
        });
    }

    init_nav();
    init_reveals();
    init_form();
}());
