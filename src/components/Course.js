import React from "react";

const Course = ({ course, refreshCourses }) => {
  const { fields, id } = course;
  const markCoursePurchased = async () => {
    try {
      await fetch("/courses", {
        method: "PUT",

        body: JSON.stringify({
          records: [
            {
              id,
              fields: {
                ...fields,
                purchased: true,
              },
            },
          ],
          typecast: true,
        }),
      });
      refreshCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCourse = async () => {
    try {
      await fetch(`/courses?records[]=${id}`, {
        method: "DELETE",
      });
      refreshCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="list-group-item pb-1">
      <a href={fields.link}>
        <h4 className="list-group-item-heading">{fields.name}</h4>
      </a>
      <p>
        Tags:{" "}
        {fields.tags &&
          fields.tags.map((tag, index) => (
            <span className="badge badge-primary mr-2" key={index}>
              {tag}
            </span>
          ))}
      </p>
      {!fields.purchased && (
        <button
          className="btn btn-sm btn-primary"
          onClick={markCoursePurchased}
        >
          Purchased
        </button>
      )}
      <button className="btn btn-sm btn-danger ml-2" onClick={deleteCourse}>
        Delete
      </button>
    </div>
  );
};
export default Course;
